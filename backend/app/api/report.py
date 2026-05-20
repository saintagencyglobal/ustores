from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.report import PhotoReport
from app.models.work_site import WorkSite
from app.schemas.report import PhotoReportOut
from app.utils.auth import get_current_user
from app.utils.upload import save_upload, extract_exif, verify_photo_time, verify_photo_location

router = APIRouter()


@router.post("/photo", response_model=PhotoReportOut)
async def create_photo_report(
    report_type: str = Form(...),
    comment: str | None = Form(None),
    photo: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if report_type not in ("cleaning", "collection"):
        raise HTTPException(status_code=400, detail="Type must be 'cleaning' or 'collection'")

    content = await photo.read()
    exif = extract_exif(content)

    time_check = verify_photo_time(exif["datetime"])
    location_check = {"valid": False, "error": "No work site assigned"}
    verified_location = False

    if user.work_site_id:
        result = await db.execute(select(WorkSite).where(WorkSite.id == user.work_site_id))
        site = result.scalar_one_or_none()
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

    report = PhotoReport(
        user_id=user.id,
        report_type=report_type,
        photo_url=photo_url,
        comment=comment,
        verified_time=time_check["valid"],
        verified_location=location_check["valid"],
        verification_error="; ".join(verification_errors) if verification_errors else None,
    )
    db.add(report)
    await db.flush()

    return PhotoReportOut(
        id=str(report.id),
        user_id=str(report.user_id),
        report_type=report.report_type,
        photo_url=report.photo_url,
        comment=report.comment,
        verified_time=report.verified_time,
        verified_location=report.verified_location,
        verification_error=report.verification_error,
        created_at=report.created_at,
    )


@router.get("/photos", response_model=list[PhotoReportOut])
async def get_my_reports(
    report_type: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(PhotoReport).where(PhotoReport.user_id == user.id)
    if report_type:
        query = query.where(PhotoReport.report_type == report_type)
    query = query.order_by(PhotoReport.created_at.desc())

    result = await db.execute(query)
    reports = result.scalars().all()
    return [
        PhotoReportOut(
            id=str(r.id),
            user_id=str(r.user_id),
            report_type=r.report_type,
            photo_url=r.photo_url,
            comment=r.comment,
            verified_time=r.verified_time,
            verified_location=r.verified_location,
            verification_error=r.verification_error,
            created_at=r.created_at,
        )
        for r in reports
    ]
