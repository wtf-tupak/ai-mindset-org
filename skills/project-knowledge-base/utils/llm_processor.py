"""Process collected data through LLM API to fill PKB.md sections."""

import asyncio
import json
import os
from typing import Dict, List, Optional, Union

SYSTEM_PROMPT = """Ты — ассистент по управлению проектами маркетингового агентства.

Тебе предоставлены:
1. Текущее содержимое карточки проекта (PKB.md) — может быть пустым при инициализации.
2. Новые данные из источников.
3. Шаблон карточки проекта (при инициализации).

Твоя задача:
- Извлечь из новых данных информацию, релевантную для каждой секции шаблона.
- Дедуплицировать: если факт уже есть в PKB.md — не дублировать.
- Конденсировать: убирай воду и повторения, но сохраняй важный контекст и нюансы.
  Договорённости и формулировки решений сохраняй близко к оригиналу.
- Маппить: помещай информацию в правильную секцию согласно шаблону.
- Хронологию дополняй новыми событиями в формате:
  [YYYY-MM-DD] Событие (источник).
- В секции "Тонкости работы с клиентом" фиксируй любые сигналы о предпочтениях,
  раздражителях и специфике согласований — даже если они упомянуты вскользь.
- В секции "Конкуренты" заполняй таблицу по мере обнаружения упоминаний.
- Данные из папки "Коммерческая информация" помечай "(только менеджер проекта)".
- Верни полный обновлённый PKB.md с сохранённым frontmatter."""

SUMMARIZE_SYSTEM_PROMPT = """Ты обрабатываешь данные из источника для базы знаний маркетингового проекта.

Извлеки и структурируй только фактически значимые данные:
- Ключевые решения и договорённости
- Участники и их роли
- Важные даты и события
- Специфика работы с клиентом

НЕ интерпретируй и НЕ делай выводов. Только структурированные факты.
Сохраняй точные формулировки решений.
Формат: Markdown, группируй по темам."""

BUILD_PKB_SYSTEM_PROMPT = """Ты — ассистент по управлению проектами маркетингового агентства.
Заполни шаблон карточки проекта (PKB.md) на основе предоставленных суммаризированных данных из источников.
- Маппи информацию в правильные секции шаблона.
- Данные из "Коммерческая информация" помечай "(только менеджер проекта)".
- Хронологию добавляй в формате: [YYYY-MM-DD] Событие (источник).
- В "Тонкости работы с клиентом" фиксируй любые сигналы, даже вскользь.
- В "Конкуренты" заполняй таблицу по мере обнаружения упоминаний.
- Верни полный PKB.md с frontmatter."""

OPENAI_MODEL = "gpt-4o"
ANTHROPIC_MODEL = "claude-opus-4-5"
MAX_TOKENS = 8192


def _normalize_pkb_markdown(text: str) -> str:
    """Strip surrounding Markdown code fences from full-document LLM output."""
    content = (text or "").strip()
    if not content.startswith("```"):
        return content

    lines = content.splitlines()
    if len(lines) < 3:
        return content

    first = lines[0].strip().lower()
    last = lines[-1].strip()
    if last != "```":
        return content

    if first in {"```", "```markdown", "```md"}:
        return "\n".join(lines[1:-1]).strip()
    return content


class LLMProcessor:
    def __init__(self):
        provider = (os.environ.get("LLM_PROVIDER") or "").strip().lower()
        if provider not in {"", "openai", "anthropic"}:
            raise EnvironmentError("LLM_PROVIDER должен быть 'openai' или 'anthropic'")

        openai_key = os.environ.get("OPENAI_API_KEY")
        anthropic_key = os.environ.get("ANTHROPIC_API_KEY")

        # Без явного выбора нельзя молча отправлять данные в один из двух провайдеров.
        if not provider:
            if openai_key and anthropic_key:
                raise EnvironmentError("LLM_PROVIDER обязателен, когда заданы и OPENAI_API_KEY, и ANTHROPIC_API_KEY")
            if openai_key:
                provider = "openai"
            elif anthropic_key:
                provider = "anthropic"

        if provider == "openai":
            if not openai_key:
                raise EnvironmentError("OPENAI_API_KEY не задан в .env")
            from openai import OpenAI  # lazy import — не ломает тесты, где openai не установлен

            self._provider = "openai"
            self._client = OpenAI(api_key=openai_key)
            return

        if provider == "anthropic":
            if not anthropic_key:
                raise EnvironmentError("ANTHROPIC_API_KEY не задан в .env")
            import anthropic  # lazy import — не ломает тесты, где anthropic не установлен

            self._provider = "anthropic"
            self._client = anthropic.Anthropic(api_key=anthropic_key)
            return

        raise EnvironmentError("Нужен OPENAI_API_KEY или ANTHROPIC_API_KEY в .env")

    def _call_llm(self, system: str, user_content: str) -> str:
        if self._provider == "openai":
            response = self._client.chat.completions.create(
                model=OPENAI_MODEL,
                max_tokens=MAX_TOKENS,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_content},
                ],
            )
            content = response.choices[0].message.content
            return _normalize_pkb_markdown(content or "")

        message = self._client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=MAX_TOKENS,
            system=system,
            messages=[{"role": "user", "content": user_content}],
        )
        return _normalize_pkb_markdown(message.content[0].text)

    def process(
        self,
        current_pkb: str,
        new_data: dict,
        template: Optional[str],
        mode: str,
    ) -> str:
        user_content = self._build_user_message(current_pkb, new_data, template, mode)
        return self._call_llm(SYSTEM_PROMPT, user_content)

    async def summarize_source(
        self,
        source_name: str,
        data: Union[List[dict], dict],
        project_name: str,
    ) -> str:
        user_msg = f"Источник: **{source_name}**\nПроект: **{project_name}**\n\n## Данные\n\n{_serialize(data)}"
        return await asyncio.to_thread(self._call_llm, SUMMARIZE_SYSTEM_PROMPT, user_msg)

    async def build_pkb_from_summaries(
        self,
        summaries: Dict[str, str],
        template: str,
        project_name: str,
    ) -> str:
        parts = [
            f"Проект: **{project_name}**",
            f"## Шаблон PKB\n\n{template}",
            "## Суммаризированные данные по источникам",
        ]
        for source, summary in summaries.items():
            parts.append(f"### {source}\n\n{summary}")
        parts.append("Заполни шаблон PKB.md и верни полный документ.")
        user_msg = "\n\n---\n\n".join(parts)
        return await asyncio.to_thread(self._call_llm, BUILD_PKB_SYSTEM_PROMPT, user_msg)

    async def update_pkb(
        self,
        current_pkb: str,
        raw_data: dict,
        project_name: str,
    ) -> str:
        user_msg = self._build_user_message(current_pkb, raw_data, template=None, mode="update")
        return await asyncio.to_thread(self._call_llm, SYSTEM_PROMPT, user_msg)

    def _build_user_message(
        self,
        current_pkb: str,
        new_data: dict,
        template: Optional[str],
        mode: str,
    ) -> str:
        parts = [f"Режим: **{mode}**"]

        if template:
            parts.append(f"## Шаблон PKB\n\n{template}")

        if current_pkb:
            parts.append(f"## Текущий PKB.md\n\n{current_pkb}")
        else:
            parts.append("## Текущий PKB.md\n\n(пустой — первичная инициализация)")

        parts.append("## Новые данные из источников")
        for source_name, source_data in new_data.items():
            if source_data:
                parts.append(f"### {source_name}\n\n{_serialize(source_data)}")

        parts.append("Верни полный обновлённый PKB.md.")
        return "\n\n---\n\n".join(parts)


def _serialize(data: object) -> str:
    if isinstance(data, str):
        return data
    return json.dumps(data, ensure_ascii=False, indent=2)
