import pytest

from sources.mootem import MooTeamSource


@pytest.fixture
def mootem_env(monkeypatch):
    monkeypatch.setenv("MOOTEM_LOGIN", "test@example.com")
    monkeypatch.setenv("MOOTEM_PASSWORD", "password")


def test_enrich_task_uses_workspace_path_part(mootem_env):
    src = MooTeamSource(
        {
            "channels": {
                "moo_team_project_id": 16390,
                "moo_team_workspace_path_part": "WSbawtbSmV",
            }
        }
    )
    task = src._enrich_task({"taskId": 759765})
    assert task["task_url"] == (
        "https://new-app.moo.team/WSbawtbSmV/projects/16390/tasks?modal=task-view&taskId=759765"
    )


def test_enrich_task_backward_compat_workspace_slug(mootem_env):
    src = MooTeamSource(
        {
            "channels": {
                "moo_team_project_id": 16390,
                "moo_team_workspace_slug": "WSbawtbSmV",
            }
        }
    )
    task = src._enrich_task({"taskId": 759765})
    assert task["task_url"] == (
        "https://new-app.moo.team/WSbawtbSmV/projects/16390/tasks?modal=task-view&taskId=759765"
    )
