#!/usr/bin/env python3
"""Проверка доступа к Google Drive и Gmail API."""
from __future__ import annotations

import os
import sys

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()  # загружает .env из текущей папки или родительских

from sources.google_drive import get_google_credentials


def main() -> None:
    if not os.environ.get("GOOGLE_CLIENT_ID") or not os.environ.get("GOOGLE_CLIENT_SECRET"):
        print("❌ Установите GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env или export")
        sys.exit(1)

    print("🔐 Получение учётных данных Google OAuth...")
    try:
        creds = get_google_credentials()
        print("✅ OAuth авторизация успешна")
    except Exception as e:
        print(f"❌ Ошибка авторизации: {e}")
        sys.exit(1)

    # Test Drive API
    print("\n📁 Проверка доступа к Google Drive...")
    try:
        from googleapiclient.discovery import build
        drive = build("drive", "v3", credentials=creds)
        about = drive.about().get(fields="user").execute()
        user = about.get("user", {})
        print(f"   ✅ Drive: подключено как {user.get('displayName', 'N/A')} ({user.get('emailAddress', 'N/A')})")
    except Exception as e:
        print(f"   ❌ Drive: {e}")

    # Test Gmail API
    print("\n📧 Проверка доступа к Gmail...")
    try:
        gmail = build("gmail", "v1", credentials=creds)
        profile = gmail.users().getProfile(userId="me").execute()
        print(f"   ✅ Gmail: подключено как {profile.get('emailAddress', 'N/A')} ({profile.get('messagesTotal', 0)} писем)")
    except Exception as e:
        print(f"   ❌ Gmail: {e}")

    print("\n✅ Проверка завершена")


if __name__ == "__main__":
    main()
