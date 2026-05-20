from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceIn, AttendanceOut, TodayStats, DailySummary
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/check", response_model=AttendanceOut)
async def check_in_out(
    req: AttendanceIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.type not in ("in", "out"):
        raise HTTPException(status_code=400, detail="Type must be 'in' or 'out'")

    today = date.today()
    result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.user_id == user.id,
                func.date(Attendance.time) == today,
                Attendance.type == req.type,
            )
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail=f"Already checked {req.type} today")

    attendance = Attendance(user_id=user.id, type=req.type)
    db.add(attendance)
    await db.flush()
    return AttendanceOut(id=str(attendance.id), user_id=str(attendance.user_id), type=attendance.type, time=attendance.time)


@router.get("/today", response_model=TodayStats)
async def get_today_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.user_id == user.id,
                func.date(Attendance.time) == today,
            )
        ).order_by(Attendance.time)
    )
    records = result.scalars().all()

    check_in = next((r for r in records if r.type == "in"), None)
    check_out = next((r for r in records if r.type == "out"), None)

    return TodayStats(
        checked_in=check_in is not None,
        checked_out=check_out is not None,
        check_in_time=check_in.time if check_in else None,
        check_out_time=check_out.time if check_out else None,
    )


@router.get("/month", response_model=list[DailySummary])
async def get_month_stats(
    year: int | None = None,
    month: int | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    y = year or now.year
    m = month or now.month

    result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.user_id == user.id,
                func.extract("year", Attendance.time) == y,
                func.extract("month", Attendance.time) == m,
            )
        ).order_by(Attendance.time)
    )
    records = result.scalars().all()

    daily: dict[str, dict] = {}
    for r in records:
        d = r.time.strftime("%Y-%m-%d")
        if d not in daily:
            daily[d] = {"in": None, "out": None}
        if r.type == "in":
            daily[d]["in"] = r.time
        else:
            daily[d]["out"] = r.time

    result_list = []
    for d, times in sorted(daily.items()):
        hours = None
        if times["in"] and times["out"]:
            delta = times["out"] - times["in"]
            hours = round(delta.total_seconds() / 3600, 2)
        result_list.append(DailySummary(date=d, check_in=times["in"], check_out=times["out"], hours=hours))

    return result_list
