"""Google Drive source: file listing, Google Docs and Sheets export."""

from __future__ import annotations

import asyncio
import io
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/gmail.readonly",
]

FOLDER_TO_PKB_SECTION: dict[str, str] = {
    "Анализ": "Описание проекта",
    "Аналитика": "Цели и KPI / Текущая реклама",
    "SEO": "Текущая реклама → SEO",
    "Контекст": "Текущая реклама → Контекстная реклама",
    "SMM": "Текущая реклама → SMM",
    "Маркетплейсы": "Текущая реклама → Маркетплейсы",
    "Управление репутацией": "Текущая реклама → Скрытая реклама",
    "E-mail маркетинг и мессенджеры": "Текущая реклама → E-mail / мессенджер-маркетинг",
    "Проектирование": "Ссылки и артефакты",
    "Дизайн": "Ссылки и артефакты (метаданные)",
    "Материалы": "Ссылки и артефакты (метаданные)",
    "ИИ": "Ссылки и артефакты (промты)",
    "Коммерческая информация": "Цели и KPI (только менеджер проекта)",
}

BINARY_MIME_TYPES = frozenset(
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/zip",
        "application/vnd.adobe.photoshop",
    }
)

SHEET_MAX_ROWS = 100


def get_google_credentials() -> Credentials:
    """Return valid Google OAuth2 credentials, refreshing or re-authorising as needed."""
    token_path = os.environ.get("GOOGLE_TOKEN_JSON", "./google_token.json")
    client_id = os.environ["GOOGLE_CLIENT_ID"]
    client_secret = os.environ["GOOGLE_CLIENT_SECRET"]

    creds: Credentials | None = None
    if Path(token_path).exists():
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            port = int(os.environ.get("GOOGLE_OAUTH_PORT", "8080"))
            flow = InstalledAppFlow.from_client_config(
                {
                    "installed": {
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "redirect_uris": [f"http://localhost:{port}/"],
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                    }
                },
                SCOPES,
            )
            creds = flow.run_local_server(port=port)
        Path(token_path).write_text(creds.to_json())

    return creds


class GoogleDriveSource:
    def __init__(self, config: dict):
        self._folder_id: str = config["channels"]["google_drive_folder_id"]
        self._service = None

    def fetch(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> dict:
        if since_date is None:
            since_date = datetime.now(timezone.utc) - timedelta(days=history_days)

        service = self._get_service()
        result: dict = {"files": [], "documents": [], "folder_tree": []}
        self._collect_folder(service, self._folder_id, since_date, result)
        return result

    async def fetch_async(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> dict:
        return await asyncio.to_thread(self.fetch, since_date=since_date, history_days=history_days)

    def _get_service(self):
        if self._service is None:
            self._service = build("drive", "v3", credentials=get_google_credentials())
        return self._service

    def _collect_folder(
        self,
        service,
        folder_id: str,
        since_date: datetime,
        result: dict,
    ) -> None:
        query = f"'{folder_id}' in parents and trashed = false"
        page_token = None

        while True:
            resp = (
                service.files()
                .list(
                    q=query,
                    fields="nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink)",
                    pageToken=page_token,
                )
                .execute()
            )

            for item in resp.get("files", []):
                self._process_item(service, item, since_date, result)

            page_token = resp.get("nextPageToken")
            if not page_token:
                break

    def _process_item(self, service, item: dict, since_date: datetime, result: dict) -> None:
        mime = item["mimeType"]
        section = FOLDER_TO_PKB_SECTION.get(item["name"], "Ссылки и артефакты")
        url = item.get("webViewLink", "")

        if mime == "application/vnd.google-apps.folder":
            result["folder_tree"].append({"name": item["name"], "url": url, "section": section})
            self._collect_folder(service, item["id"], since_date, result)
        elif mime == "application/vnd.google-apps.document":
            result["documents"].append(
                {
                    "name": item["name"],
                    "url": url,
                    "section": section,
                    "content": self._export_doc(service, item["id"]),
                }
            )
        elif mime == "application/vnd.google-apps.spreadsheet":
            result["documents"].append(
                {
                    "name": item["name"],
                    "url": url,
                    "section": section,
                    "content": self._export_sheet(service, item["id"]),
                }
            )
        else:
            result["files"].append(
                {
                    "name": item["name"],
                    "type": mime,
                    "url": url,
                    "modified": item.get("modifiedTime"),
                    "section": section,
                    "content": None if mime in BINARY_MIME_TYPES else None,
                }
            )

    def _export_doc(self, service, file_id: str) -> str:
        try:
            buf = io.BytesIO()
            request = service.files().export_media(fileId=file_id, mimeType="text/plain")
            downloader = MediaIoBaseDownload(buf, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            return buf.getvalue().decode("utf-8", errors="replace")
        except Exception as exc:
            return f"[Ошибка экспорта Google Doc: {exc}]"

    def _export_sheet(self, service, file_id: str) -> str:
        try:
            buf = io.BytesIO()
            request = service.files().export_media(fileId=file_id, mimeType="text/csv")
            downloader = MediaIoBaseDownload(buf, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            lines = buf.getvalue().decode("utf-8", errors="replace").splitlines()
            return "\n".join(lines[:SHEET_MAX_ROWS])
        except Exception as exc:
            return f"[Ошибка экспорта Google Sheet: {exc}]"
