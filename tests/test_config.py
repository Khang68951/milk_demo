import os

import pytest

from milk import config


def test_env_file_fills_missing_settings_but_never_overrides(tmp_path, monkeypatch):
    env = tmp_path / "worker.env"
    env.write_text(
        "# comment line\n"
        "MILK_TEST_A=from-file\n"
        "MILK_TEST_B = 'quoted value'\n"
        "MILK_TEST_C=from-file\n"
        "not a setting\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("MILK_TEST_C", "from-environment")
    for key in ("MILK_TEST_A", "MILK_TEST_B"):
        monkeypatch.delenv(key, raising=False)
    config.load_env_file(str(env))
    assert os.environ["MILK_TEST_A"] == "from-file"
    assert os.environ["MILK_TEST_B"] == "quoted value"
    assert os.environ["MILK_TEST_C"] == "from-environment"
    for key in ("MILK_TEST_A", "MILK_TEST_B"):
        monkeypatch.delenv(key, raising=False)


def test_hub_url_falls_back_to_the_old_name(monkeypatch):
    monkeypatch.delenv("MILK_HUB_URL", raising=False)
    monkeypatch.setenv("MILK_WEB_INTERNAL_URL", "http://127.0.0.1:8080")
    assert config.load().hub_url == "http://127.0.0.1:8080"
    monkeypatch.setenv("MILK_HUB_URL", "https://example.cloudfront.net")
    assert config.load().hub_url == "https://example.cloudfront.net"


@pytest.mark.parametrize("raw", ["0.1,0.2,0.8", "1.2,0,0.5,0.5", "0,0,0,0.5"])
def test_bad_roi_is_rejected(monkeypatch, raw):
    monkeypatch.setenv("MILK_ROI", raw)
    with pytest.raises(ValueError):
        config.load()
