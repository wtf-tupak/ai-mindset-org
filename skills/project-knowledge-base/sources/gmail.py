"""Gmail source: project emails filtered by label."""

from __future__ import annotations

import asyncio
import base64
from datetime import datetime, timedelta, timezone

from googleapiclient.discovery import build

from .google_drive import get_google_credentials


class GmailSource:
    def __init__(self, config: dict):
        self._label: str = config["channels"].get("gmail_label", "")
        self._service = None

    def fetch(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> list[dict]:
        if since_date is None:
            since_date = datetime.now(timezone.utc) - timedelta(days=history_days)

        service = self._get_service()
        date_str = since_date.strftime("%Y/%m/%d")
        query = f"after:{date_str}"
        if self._label:
            query += f" label:{self._label}"

        messages: list[dict] = []
        page_token = None

        while True:
            resp = service.users().messages().list(userId="me", q=query, pageToken=page_token, maxResults=100).execute()

            for msg_ref in resp.get("messages", []):
                msg = service.users().messages().get(userId="me", id=msg_ref["id"], format="full").execute()
                messages.append(_parse_message(msg))

            page_token = resp.get("nextPageToken")
            if not page_token:
                break

        return messages

    async def fetch_async(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> list[dict]:
        return await asyncio.to_thread(self.fetch, since_date=since_date, history_days=history_days)

    def _get_service(self):
        if self._service is None:
            self._service = build("gmail", "v1", credentials=get_google_credentials())
        return self._service


def _parse_message(msg: dict) -> dict:
    headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
    return {
        "id": msg["id"],
        "from": headers.get("From", ""),
        "to": headers.get("To", ""),
        "date": headers.get("Date", ""),
        "subject": headers.get("Subject", ""),
        "body": _extract_body(msg["payload"]),
        "attachments": _extract_attachments(msg["payload"]),
    }


def _extract_body(payload: dict) -> str:
    if payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")
    for part in payload.get("parts", []):
        if part.get("mimeType") == "text/plain":
            data = part.get("body", {}).get("data", "")
            if data:
                return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
    return ""


def _extract_attachments(payload: dict) -> list[dict]:
    return [
        {"name": part["filename"], "type": part.get("mimeType", "")}
        for part in payload.get("parts", [])
        if part.get("filename")
    ]
