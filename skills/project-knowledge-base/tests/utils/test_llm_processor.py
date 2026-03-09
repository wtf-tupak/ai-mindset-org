import sys
from unittest.mock import MagicMock

import pytest

from utils.llm_processor import LLMProcessor


def _setup_openai_mock(monkeypatch):
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="# PKB Result"))]
    mock_instance.chat.completions.create.return_value = mock_response

    fake_openai = MagicMock()
    fake_openai.OpenAI.return_value = mock_instance
    monkeypatch.setitem(sys.modules, "openai", fake_openai)
    return fake_openai, mock_instance


def _setup_anthropic_mock(monkeypatch):
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="# PKB Result")]
    mock_instance.messages.create.return_value = mock_response

    fake_anthropic = MagicMock()
    fake_anthropic.Anthropic.return_value = mock_instance
    monkeypatch.setitem(sys.modules, "anthropic", fake_anthropic)
    return fake_anthropic, mock_instance


@pytest.fixture
def mock_openai(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    _fake_openai, mock_instance = _setup_openai_mock(monkeypatch)
    yield mock_instance


def test_requires_explicit_provider_when_both_api_keys_present(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "openai-key")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "anthropic-key")
    fake_openai, _ = _setup_openai_mock(monkeypatch)
    fake_anthropic, _ = _setup_anthropic_mock(monkeypatch)

    with pytest.raises(EnvironmentError, match="LLM_PROVIDER"):
        LLMProcessor()

    assert not fake_openai.OpenAI.called
    assert not fake_anthropic.Anthropic.called


def test_explicit_provider_override_to_openai(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "openai-key")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "anthropic-key")
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    fake_openai, _ = _setup_openai_mock(monkeypatch)
    fake_anthropic, _ = _setup_anthropic_mock(monkeypatch)

    LLMProcessor()

    assert fake_openai.OpenAI.called
    assert not fake_anthropic.Anthropic.called


def test_uses_anthropic_when_openai_key_missing(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "anthropic-key")
    fake_anthropic, mock_anthropic_instance = _setup_anthropic_mock(monkeypatch)

    processor = LLMProcessor()
    result = processor.process(
        current_pkb="",
        new_data={"gmail": [{"body": "data"}]},
        template="# Template",
        mode="init",
    )

    assert fake_anthropic.Anthropic.called
    assert mock_anthropic_instance.messages.create.called
    assert result == "# PKB Result"


def test_explicit_provider_override_to_anthropic(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "openai-key")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "anthropic-key")
    monkeypatch.setenv("LLM_PROVIDER", "anthropic")
    fake_openai, _ = _setup_openai_mock(monkeypatch)
    fake_anthropic, _ = _setup_anthropic_mock(monkeypatch)

    LLMProcessor()

    assert fake_anthropic.Anthropic.called
    assert not fake_openai.OpenAI.called


@pytest.mark.asyncio
async def test_summarize_source_calls_llm(mock_openai):
    processor = LLMProcessor()
    result = await processor.summarize_source(
        source_name="gmail",
        data=[{"from": "a@b.com", "subject": "Привет", "body": "Текст"}],
        project_name="Тест",
    )
    assert mock_openai.chat.completions.create.called
    assert isinstance(result, str)
    assert result == "# PKB Result"


@pytest.mark.asyncio
async def test_build_pkb_from_summaries_calls_llm(mock_openai):
    processor = LLMProcessor()
    result = await processor.build_pkb_from_summaries(
        summaries={"gmail": "Summary Gmail", "mootem": "Summary mootem"},
        template="# Template",
        project_name="Тест",
    )
    assert mock_openai.chat.completions.create.called
    assert isinstance(result, str)


@pytest.mark.asyncio
async def test_update_pkb_calls_llm(mock_openai):
    processor = LLMProcessor()
    result = await processor.update_pkb(
        current_pkb="# Old PKB",
        raw_data={"gmail": [{"body": "new info"}]},
        project_name="Тест",
    )
    assert mock_openai.chat.completions.create.called
    assert isinstance(result, str)


def test_process_still_works(mock_openai):
    """Backward compatibility: existing sync process() method still works."""
    processor = LLMProcessor()
    result = processor.process(
        current_pkb="",
        new_data={"gmail": [{"body": "data"}]},
        template="# Template",
        mode="init",
    )
    assert isinstance(result, str)


def test_normalizes_openai_markdown_code_fence(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content="""```markdown
---
project_id: "medall"
---

# Title
```"""
            )
        )
    ]
    mock_instance.chat.completions.create.return_value = mock_response

    fake_openai = MagicMock()
    fake_openai.OpenAI.return_value = mock_instance
    monkeypatch.setitem(sys.modules, "openai", fake_openai)

    processor = LLMProcessor()
    result = processor.process(
        current_pkb="",
        new_data={"gmail": [{"body": "data"}]},
        template="# Template",
        mode="init",
    )

    assert not result.startswith("```")
    assert result.startswith("---")
    assert "# Title" in result


def test_normalizes_anthropic_markdown_code_fence(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "anthropic-key")
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="```md\n# PKB\n```")]
    mock_instance.messages.create.return_value = mock_response

    fake_anthropic = MagicMock()
    fake_anthropic.Anthropic.return_value = mock_instance
    monkeypatch.setitem(sys.modules, "anthropic", fake_anthropic)

    processor = LLMProcessor()
    result = processor.process(
        current_pkb="",
        new_data={"gmail": [{"body": "data"}]},
        template="# Template",
        mode="init",
    )

    assert result == "# PKB"


@pytest.mark.asyncio
async def test_summarize_source_uses_summarize_system_prompt(mock_openai):
    """summarize_source uses a different system prompt than SYSTEM_PROMPT."""
    from utils.llm_processor import SUMMARIZE_SYSTEM_PROMPT, SYSTEM_PROMPT

    assert SUMMARIZE_SYSTEM_PROMPT != SYSTEM_PROMPT
    processor = LLMProcessor()
    await processor.summarize_source("gmail", [], "Тест")
    call_kwargs = mock_openai.chat.completions.create.call_args
    messages = call_kwargs.kwargs.get("messages", [])
    used_system = next((m.get("content") for m in messages if m.get("role") == "system"), None)
    assert used_system == SUMMARIZE_SYSTEM_PROMPT
