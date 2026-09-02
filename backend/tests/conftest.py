import pytest
import os
import sys

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base, get_db
from backend.app.main import app, seed_initial_data

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_api_security.db"

# Remove any pre-existing test db
if os.path.exists("./test_api_security.db"):
    try:
        os.remove("./test_api_security.db")
    except Exception:
        pass

test_engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Override get_db
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    
    test_db = TestingSessionLocal()
    seed_initial_data(db_session=test_db)
    test_db.close()
    
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_api_security.db"):
        try:
            os.remove("./test_api_security.db")
        except Exception:
            pass


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
