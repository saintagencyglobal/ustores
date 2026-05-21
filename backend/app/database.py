from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from app.config import settings

engine = create_async_engine(settings.async_database_url, echo=False)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        from sqlalchemy import text
        migration_sql = [
            "ALTER TABLE attendances ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)",
            "ALTER TABLE attendances ADD COLUMN IF NOT EXISTS verified_time BOOLEAN DEFAULT FALSE",
            "ALTER TABLE attendances ADD COLUMN IF NOT EXISTS verified_location BOOLEAN DEFAULT FALSE",
            "ALTER TABLE attendances ADD COLUMN IF NOT EXISTS verification_error TEXT",
        ]
        for sql in migration_sql:
            try:
                await conn.execute(text(sql))
            except Exception:
                pass
