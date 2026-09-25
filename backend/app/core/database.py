"""Database engine and session management using SQLAlchemy 2.x."""

from collections.abc import Generator
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# Dialect safe fallback: SQLite if PostgreSQL / psycopg is unavailable locally
db_url = settings.DATABASE_URL
try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        # Try creating engine with PostgreSQL
        engine = create_engine(
            db_url,
            echo=False,
            pool_pre_ping=True,
        )
except Exception:
    engine = create_engine("sqlite:///./krishi.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session per request."""
    # Ensure tables exist on local SQLite if running standalone
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
