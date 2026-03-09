from utils.pkb_writer import PKBWriter


def _make_writer(tmp_path, monkeypatch):
    monkeypatch.setenv("OBSIDIAN_VAULT_PATH", str(tmp_path))
    config = {"obsidian_path": "Проекты/Тест"}
    return PKBWriter(config)


def test_write_creates_file(tmp_path, monkeypatch):
    w = _make_writer(tmp_path, monkeypatch)
    w.write("# Hello\n")
    assert w.exists()
    assert w._path.read_text() == "# Hello\n"


def test_write_is_atomic(tmp_path, monkeypatch):
    """No .tmp file left after successful write."""
    w = _make_writer(tmp_path, monkeypatch)
    w.write("# Content\n")
    tmp_files = list(w._path.parent.glob("*.tmp"))
    assert tmp_files == []


def test_write_overwrites_existing(tmp_path, monkeypatch):
    w = _make_writer(tmp_path, monkeypatch)
    w.write("# Old\n")
    w.write("# New\n")
    assert w._path.read_text() == "# New\n"


def test_get_last_sync_returns_none_when_missing(tmp_path, monkeypatch):
    w = _make_writer(tmp_path, monkeypatch)
    assert w.get_last_sync() is None
