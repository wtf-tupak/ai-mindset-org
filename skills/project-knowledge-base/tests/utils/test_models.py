from utils.models import SourceResult


def test_source_result_defaults():
    r = SourceResult(source="gmail", data=[{"id": "1"}])
    assert r.status == "success"
    assert r.items_count == 1
    assert r.error_message is None


def test_source_result_error():
    r = SourceResult(source="gmail", data=[], status="error", error_message="timeout")
    assert r.items_count == 0
    assert r.is_ok is False


def test_source_result_success_is_ok():
    r = SourceResult(source="gmail", data=[{}])
    assert r.is_ok is True


def test_source_result_partial_is_ok():
    r = SourceResult(source="gmail", data=[{}], status="partial")
    assert r.is_ok is True


def test_error_without_message_is_allowed():
    r = SourceResult(source="x", data=[], status="error")
    assert r.error_message is None
    assert r.is_ok is False
