import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

database_url = settings.DATABASE_URL

# Normalize sqlite URL for absolute / relative consistency
if database_url.startswith("sqlite"):
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from backend.app import models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Automatically add missing columns in SQLite if tables existed prior to model schema changes
    try:
        with engine.connect() as conn:
            res = conn.exec_driver_sql("PRAGMA table_info(payments)")
            cols = [r[1] for r in res.fetchall()]
            if cols:
                if "provider_transaction_id" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN provider_transaction_id VARCHAR(100)")
                if "provider_reference" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN provider_reference VARCHAR(100)")
                if "verification_status" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN verification_status VARCHAR(30) DEFAULT 'created'")
                if "verification_source" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN verification_source VARCHAR(50) DEFAULT 'demo'")
                if "initiated_at" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN initiated_at DATETIME")
                if "verified_at" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN verified_at DATETIME")
                if "failed_at" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN failed_at DATETIME")
                if "payment_metadata" not in cols:
                    conn.exec_driver_sql("ALTER TABLE payments ADD COLUMN payment_metadata JSON DEFAULT '{}'")

            res_users = conn.exec_driver_sql("PRAGMA table_info(users)")
            user_cols = [r[1] for r in res_users.fetchall()]
            if user_cols and "phone" not in user_cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")

            conn.commit()
    except Exception as err:
        print(f"Schema migration warning: {err}")
