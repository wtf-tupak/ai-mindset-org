import asyncio
from dataclasses import dataclass

from sources.telegram_group import TelegramGroupSource


@dataclass
class _FakeDialog:
    id: int
    name: str
    entity: object


class _FakeMessage:
    def __init__(self, msg_id: int, text: str):
        self.id = msg_id
        self.text = text
        self.date = None
        self.sender_id = 1


class _FakeClient:
    def __init__(self, *, entity_for_messages: object, dialogs: list[_FakeDialog], message_text: str = "hello"):
        self._entity_for_messages = entity_for_messages
        self._dialogs = dialogs
        self._message_text = message_text
        self.messages_target = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get_entity(self, _group_ref):
        raise ValueError("not found directly")

    async def iter_dialogs(self):
        for d in self._dialogs:
            yield d

    async def iter_messages(self, target, **_kwargs):
        self.messages_target = target
        yield _FakeMessage(1, self._message_text)


def test_group_source_fallback_to_iter_dialogs_by_id(monkeypatch):
    entity = object()
    fake_client = _FakeClient(
        entity_for_messages=entity,
        dialogs=[_FakeDialog(id=-1003588778228, name="Medall Сайт и SEO", entity=entity)],
    )

    monkeypatch.setattr("sources.telegram_group.TelegramClient", lambda *args, **kwargs: fake_client)
    monkeypatch.setattr("sources.telegram_group.Message", _FakeMessage)

    config = {"channels": {"telegram_group_id": -1003588778228}}
    src = TelegramGroupSource(config)

    result = asyncio.run(src.fetch_async(history_days=1))

    assert len(result) == 1
    assert fake_client.messages_target is entity


def test_group_source_fallback_to_iter_dialogs_by_name(monkeypatch):
    entity = object()
    fake_client = _FakeClient(
        entity_for_messages=entity,
        dialogs=[_FakeDialog(id=-1003588778228, name="Medall Сайт и SEO", entity=entity)],
        message_text="from name resolution",
    )

    monkeypatch.setattr("sources.telegram_group.TelegramClient", lambda *args, **kwargs: fake_client)
    monkeypatch.setattr("sources.telegram_group.Message", _FakeMessage)

    config = {"channels": {"telegram_group_id": "medall сайт и seo"}}
    src = TelegramGroupSource(config)

    result = asyncio.run(src.fetch_async(history_days=1))

    assert len(result) == 1
    assert result[0]["text"] == "from name resolution"
    assert fake_client.messages_target is entity
