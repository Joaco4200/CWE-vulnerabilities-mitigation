import pytest
from fastapi.testclient import TestClient
from src.main import app

client=TestClient(app)

def test_sql_inyection_invoiceService():
    user_id="user1"

    maliciousInput = "paid' OR '1'='1"
    url = "http://localhost:5001"  

    response = requests.get(f"{url}/invoices?userId={user_id}&status={malicious_status}")

    assert response.status_code == 400 or response.json() == []