"""Load and parse the master project index from _projects_index.yaml."""

import os
from pathlib import Path

import yaml


def load_project_config(project_id: str) -> dict:
    index_path = _resolve_index_path()
    with open(index_path, encoding="utf-8") as f:
        projects = yaml.safe_load(f)

    for project in projects:
        if project.get("project_id") == project_id:
            return project

    raise ValueError(f"Проект '{project_id}' не найден в {index_path}")


def list_project_ids() -> list[str]:
    index_path = _resolve_index_path()
    with open(index_path, encoding="utf-8") as f:
        projects = yaml.safe_load(f)
    return [p["project_id"] for p in projects if "project_id" in p]


def _resolve_index_path() -> Path:
    index_rel = os.environ.get("PROJECTS_INDEX_PATH", "Агентство/Проекты/_projects_index.yaml")
    vault = os.environ.get("OBSIDIAN_VAULT_PATH")
    if not vault:
        raise EnvironmentError("OBSIDIAN_VAULT_PATH не задан в .env")
    return Path(vault) / index_rel
