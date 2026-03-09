"""moo.team source: project tasks and comments via REST API."""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timedelta, timezone
from typing import Iterator

import requests


class MooTeamSource:
    def __init__(self, config: dict):
        channels = config["channels"]
        self._base_url = os.environ.get("MOOTEM_BASE_URL", "https://api.moo.team/api/v2")
        self._login = os.environ["MOOTEM_LOGIN"]
        self._password = os.environ["MOOTEM_PASSWORD"]
        self._project_id: int = channels["moo_team_project_id"]
        self._workspace_path_part: str = channels.get("moo_team_workspace_path_part") or channels.get(
            "moo_team_workspace_slug", ""
        )
        self._token: str | None = None

    def fetch(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> dict:
        if since_date is None:
            since_date = datetime.now(timezone.utc) - timedelta(days=history_days)

        tasks = list(self._fetch_tasks(since_date))
        comments_by_task = {task["taskId"]: list(self._fetch_comments(task["taskId"])) for task in tasks}

        return {
            "tasks": tasks,
            "comments": comments_by_task,
            "workspace_path_part": self._workspace_path_part,
        }

    async def fetch_async(
        self,
        since_date: datetime | None = None,
        history_days: int = 180,
    ) -> dict:
        return await asyncio.to_thread(self.fetch, since_date=since_date, history_days=history_days)

    def _authenticate(self) -> None:
        resp = requests.post(
            f"{self._base_url}/auth/tokens",
            json={"login": self._login, "password": self._password},
            timeout=30,
        )
        resp.raise_for_status()
        self._token = resp.json()["token"]

    def _headers(self) -> dict:
        if not self._token:
            self._authenticate()
        return {"Authorization": f"Bearer {self._token}"}

    def _fetch_tasks(self, since_date: datetime) -> Iterator[dict]:
        page = 1
        while True:
            resp = requests.get(
                f"{self._base_url}/tasks",
                headers=self._headers(),
                params={
                    "filters[projectId]": self._project_id,
                    "fields": (
                        "taskId,projectId,header,description,userId,creatorId,"
                        "coPerformerId,startDate,endDate,closeDate,status,statusId,"
                        "timeCreated,timeUpdated,priority,plannedTime"
                    ),
                    "expand": "user,creator,taskStatus,labels",
                    "per-page": 100,
                    "page": page,
                },
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()

            for task in data.get("items", []):
                time_updated = task.get("timeUpdated", 0)
                if time_updated and datetime.fromtimestamp(time_updated, tz=timezone.utc) >= since_date:
                    yield self._enrich_task(task)

            meta = data.get("meta", {})
            if page >= meta.get("pageCount", 1):
                break
            page += 1

    def _fetch_comments(self, task_id: int) -> Iterator[dict]:
        resp = requests.get(
            f"{self._base_url}/comments",
            headers=self._headers(),
            params={
                "filters[taskId]": task_id,
                "fields": "commentId,taskId,userId,content,timeCreated,timeUpdated",
                "expand": "user",
                "sort": "-timeCreated",
            },
            timeout=30,
        )
        resp.raise_for_status()
        yield from resp.json().get("items", [])

    def _enrich_task(self, task: dict) -> dict:
        task["task_url"] = (
            f"https://new-app.moo.team"
            f"/{self._workspace_path_part}"
            f"/projects/{self._project_id}"
            f"/tasks?modal=task-view&taskId={task['taskId']}"
        )
        return task
