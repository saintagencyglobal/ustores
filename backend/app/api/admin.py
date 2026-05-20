from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.report import PhotoReport
from app.models.work_site import WorkSite
from app.schemas.user import UserOut
from app.schemas.report import PhotoReportOut
from app.utils.auth import get_current_user

router = APIRouter()


def require_admin(user: User):
    if user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Access denied")


@router.get("/users", response_model=list[UserOut])
async def list_users(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    result = await db.execute(select(User).order_by(User.name))
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    result = await db.execute(select(User).where(User.id == user_id))
    u = result.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.patch("/users/{user_id}/site")
async def assign_site(
    user_id: str,
    work_site_id: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    result = await db.execute(select(User).where(User.id == user_id))
    u = result.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.work_site_id = work_site_id
    await db.flush()
    return {"message": "Updated"}


@router.get("/stats/today")
async def today_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    from sqlalchemy import func
    today = func.date(func.now())

    result = await db.execute(select(func.count()).select_from(User))
    workers = result.scalar()

    result = await db.execute(select(func.count()).select_from(WorkSite))
    sites = result.scalar()

    return {"workers": workers, "sites": sites, "reports": 0}
