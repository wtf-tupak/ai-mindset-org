#!/usr/bin/env python3
"""Проверка подключения к Telegram через MTProto (Telethon) по QR-коду."""
from __future__ import annotations

import asyncio
import getpass
import os
import sys

import pyqrcode

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from telethon import TelegramClient
from telethon import errors
from sources.telegram_utils import TelegramCredentials


def _show_qr(url: str) -> None:
    """Выводит QR-код в терминал."""
    print("\n📱 Отсканируйте QR-код в Telegram:")
    print("   Настройки → Устройства → Связать устройство\n")
    try:
        qr = pyqrcode.create(url)
        print(qr.terminal(quiet_zone=1))
    except Exception:
        pass
    print(f"   Или откройте ссылку на телефоне: {url}\n")


async def _qr_login_flow(client: TelegramClient) -> None:
    """Авторизация по QR-коду с поддержкой 2FA и обновлением при истечении."""
    while True:
        qr_login = await client.qr_login()
        _show_qr(qr_login.url)

        try:
            await qr_login.wait(timeout=60)
            return
        except errors.SessionPasswordNeededError:
            print("\n🔐 Включена двухфакторная аутентификация.")
            password = getpass.getpass("Введите пароль 2FA: ")
            await client.sign_in(password=password)
            return
        except asyncio.TimeoutError:
            print("\n⏳ QR-код истёк. Генерирую новый...")
            await qr_login.recreate()


async def main() -> None:
    creds = TelegramCredentials.from_env()
    if not creds.api_id or not creds.api_hash:
        print("❌ Установите TELEGRAM_API_ID и TELEGRAM_API_HASH в .env")
        print("   Получить: https://my.telegram.org")
        sys.exit(1)

    print("🔐 Подключение к Telegram...")
    try:
        client = TelegramClient(
            creds.session, creds.api_id, creds.api_hash
        )
        await client.connect()

        if not await client.is_user_authorized():
            await _qr_login_flow(client)

        me = await client.get_me()
        if me:
            name = me.first_name or ""
            if me.last_name:
                name += f" {me.last_name}"
            print(f"\n✅ Подключено как: {name} (@{me.username or '—'})")
            print(f"   ID: {me.id}")
            print(f"   Сессия сохранена в: {creds.session}")
        else:
            print("❌ Не удалось получить данные аккаунта")
            sys.exit(1)

        await client.disconnect()
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        sys.exit(1)

    print("\n✅ Проверка завершена")


if __name__ == "__main__":
    asyncio.run(main())
