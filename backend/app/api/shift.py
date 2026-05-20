from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.shift import Shift
from app.schemas.shift import ShiftOut
from app.utils.auth import get_current_user
from app.utils.upload import save_upload

router = APIRouter()


@router.post("/action", response_model=ShiftOut)
async def shift_action(
    action: str,
    photo: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if action not in ("open", "close"):
        raise HTTPException(status_code=400, detail="Action must be 'open' or 'close'")

    today = func.date(func.now())
    result = await db.execute(
        select(Shift).where(
            and_(
                Shift.user_id == user.id,
                func.date(Shift.time) == today,
                Shift.action == action,
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Already {action}ed shift today")

    photo_url = None
    if photo:
        photo_url = await save_upload(photo)

    shift = Shift(user_id=user.id, action=action, photo_url=photo_url)
    db.add(shift)
    await db.flush()

    return ShiftOut(
        id=str(shift.id),
        user_id=str(shift.user_id),
        action=shift.action,
        time=shift.time,
        photo_url=shift.photo_url,
    )


@router.get("/today")
async def get_today_shift(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = func.date(func.now())
    result = await db.execute(
        select(Shift).where(
            and_(
                Shift.user_id == user.id,
                func.date(Shift.time) == today,
            )
        ).order_by(Shift.time)
    )
    records = result.scalars().all()
    return [
        ShiftOut(
            id=str(r.id),
            user_id=str(r.user_id),
            action=r.action,
            time=r.time,
            photo_url=r.photo_url,
        )
        for r in records
    ]
