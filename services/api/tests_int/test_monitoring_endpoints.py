# services/api/tests_int/test_monitoring_endpoints.py
import os
import time

import requests

API_BASE_URL = os.getenv("API_BASE_URL", "http://api:8000")


def wait_for_health(timeout=30):
    """Attend que /health réponde 200 (jusqu'à timeout secondes)."""
    deadline = time.time() + timeout
    last_err = None
    while time.time() < deadline:
        try:
            r = requests.get(f"{API_BASE_URL}/health", timeout=2)
            if r.status_code == 200 and r.json().get("status") == "ok":
                return True
        except Exception as e:
            last_err = e
        time.sleep(1)
    raise AssertionError(f"/health not ready in {timeout}s (last_err={last_err})")


def test_health_ok():
    wait_for_health()
    r = requests.get(f"{API_BASE_URL}/health", timeout=2)
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_version_ok():
    wait_for_health()
    r = requests.get(f"{API_BASE_URL}/version", timeout=2)
    assert r.status_code == 200
    body = r.json()
    assert "version" in body
    assert isinstance(body["version"], str)
    assert len(body["version"]) > 0
