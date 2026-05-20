from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.work_site import WorkSite
from app.schemas.work_site import WorkSiteIn, WorkSiteOut
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[WorkSiteOut])
async def list_sites(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Access denied")
    result = await db.execute(select(WorkSite).order_by(WorkSite.name))
    return result.scalars().all()


@router.post("/", response_model=WorkSiteOut)
async def create_site(
    req: WorkSiteIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Access denied")
    site = WorkSite(**req.model_dump())
    db.add(site)
    await db.flush()
    return WorkSiteOut(
        id=str(site.id),
        name=site.name,
        latitude=site.latitude,
        longitude=site.longitude,
        radius_meters=site.radius_meters,
    )


@router.delete("/{site_id}")
async def delete_site(
    site_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Access denied")
    result = await db.execute(select(WorkSite).where(WorkSite.id == site_id))
    site = result.scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    await db.delete(site)
    return {"message": "Deleted"}
