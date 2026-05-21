from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.attendance import Attendance
from app.models.report import PhotoReport
from app.models.work_site import WorkSite
from app.schemas.attendance import AttendanceOut, TodayStats, DailySummary
from app.utils.auth import get_current_user
from app.utils.upload import save_upload, extract_exif, verify_photo_time, verify_photo_location

router = APIRouter()


@router.post("/check", response_model=AttendanceOut)
async def check_in_out(
    type: str = Form(...),
    photo: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        if type not in ("in", "out"):
            raise HTTPException(status_code=400, detail="Type must be 'in' or 'out'")

        today = date.today()
        result = await db.execute(
            select(Attendance).where(
                and_(
                    Attendance.user_id == user.id,
                    func.date(Attendance.time) == today,
                    Attendance.type == type,
                )
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail=f"Already checked {type} today")

        content = await photo.read()
        exif = extract_exif(content)
        time_check = verify_photo_time(exif["datetime"])

        location_check = {"valid": False, "error": "No work site assigned"}
        if user.work_site_id:
            site_result = await db.execute(select(WorkSite).where(WorkSite.id == user.work_site_id))
            site = site_result.scalar_one_or_none()
            if site:
                location_check = verify_photo_location(
                    exif["gps_lat"], exif["gps_lng"],
                    site.latitude, site.longitude, site.radius_meters,
                )

        photo_url = await save_upload(photo, content)

        verification_errors = []
        if not time_check["valid"]:
            verification_errors.append(time_check["error"])
        if not location_check["valid"]:
            verification_errors.append(location_check["error"])

        attendance = Attendance(
            user_id=user.id,
            type=type,
            photo_url=photo_url,
            verified_time=time_check["valid"],
            verified_location=location_check["valid"],
            verification_error="; ".join(verification_errors) if verification_errors else None,
        )
        db.add(attendance)
        await db.flush()
        return AttendanceOut(
            id=str(attendance.id),
            user_id=str(attendance.user_id),
            type=attendance.type,
            time=attendance.time,
            photo_url=attendance.photo_url,
            verified_time=attendance.verified_time,
            verified_location=attendance.verified_location,
            verification_error=attendance.verification_error,
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/today", response_model=TodayStats)
async def get_today_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()

    att_result = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.user_id == user.id,
                func.date(Attendance.time) == today,
            )
        ).order_by(Attendance.time)
    )
    att_records = att_result.scalars().all()

    report_result = await db.execute(
        select(PhotoReport).where(
            and_(
                PhotoReport.user_id == user.id,
                func.date(PhotoReport.created_at) == today,
            )
        )
    )
    report_records = report_result.scalars().all()

    check_in = next((r for r in att_records if r.type == "in"), None)
    check_out = next((r for r in att_records if r.type == "out"), None)
    cleaning = next((r for r in report_records if r.report_type == "cleaning"), None)
    collection = next((r for r in report_records if r.report_type == "collection"), None)

    return TodayStats(
        check_in=check_in.time if check_in else None,
        check_out=check_out.time if check_out else None,
        cleaning=cleaning.created_at if cleaning else None,
        collection=collection.created_at if collection else None,
        checked_in=check_in is not None,
        checked_out=check_out is not None,
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
