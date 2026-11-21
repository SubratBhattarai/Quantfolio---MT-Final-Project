import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Respect DB_PATH env var injected by Docker; fall back to local dev default.
_local_db = os.path.join(os.path.dirname(os.path.abspath(__file__)), "quantfolio.db")
DB_PATH = os.getenv("DB_PATH", _local_db)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
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
    Base.metadata.create_all(bind=engine)
    # Self-healing migration for SQLite: ensures new columns exist without deleting data
    if "sqlite" in SQLALCHEMY_DATABASE_URL and os.path.exists(DB_PATH):
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        try:
            cur.execute("PRAGMA table_info(holdings);")
            cols = [r[1] for r in cur.fetchall()]
            if cols:
                if "currency" not in cols:
                    cur.execute("ALTER TABLE holdings ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'")
                if "last_updated" not in cols:
                    cur.execute("ALTER TABLE holdings ADD COLUMN last_updated DATETIME")
                conn.commit()
        except Exception:
            pass
        finally:
            conn.close()
