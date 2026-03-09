from utils.logger import PKBLogger
from utils.models import SourceResult


def test_logger_creates_log_file(tmp_path, monkeypatch):
    monkeypatch.setenv("PKB_LOGS_DIR", str(tmp_path))
    logger = PKBLogger("clinic-urology")
    logger.log_source(SourceResult(source="gmail", data=[{"id": "1"}]))
    log_files = list(tmp_path.glob("clinic-urology/*.log"))
    assert len(log_files) == 1


def test_logger_records_error(tmp_path, monkeypatch):
    monkeypatch.setenv("PKB_LOGS_DIR", str(tmp_path))
    logger = PKBLogger("clinic-urology")
    result = SourceResult(source="mootem", data=[], status="error", error_message="401")
    logger.log_source(result)
    content = list(tmp_path.glob("clinic-urology/*.log"))[0].read_text()
    assert "error" in content.lower()
    assert "401" in content


def test_logger_summary_format(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("PKB_LOGS_DIR", str(tmp_path))
    logger = PKBLogger("clinic-urology")
    logger.log_source(SourceResult(source="gmail", data=[{}, {}]))
    logger.log_source(SourceResult(source="mootem", data=[], status="error", error_message="401"))
    logger.print_summary()
    captured = capsys.readouterr()
    assert "✅" in captured.out
    assert "❌" in captured.out
    assert "gmail" in captured.out
    assert "mootem" in captured.out
