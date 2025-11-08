import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health(client):
    rv = client.get('/api/health')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data.get('status') == 'ok'
