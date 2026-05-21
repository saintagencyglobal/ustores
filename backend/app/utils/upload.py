import uuid
import io
import aiofiles
from datetime import datetime, timezone, timedelta
from PIL import Image, ExifTags
from fastapi import UploadFile, HTTPException
from pathlib import Path
from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE = 10 * 1024 * 1024
MAX_TIME_DRIFT_SECONDS = 300  # 5 minutes tolerance


async def save_upload(file: UploadFile, content: bytes | None = None) -> str:
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {ext}")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = upload_dir / filename

    if content is None:
        content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    async with aiofiles.open(str(filepath), "wb") as f:
        await f.write(content)

    return f"/uploads/{filename}"


def extract_exif(image_bytes: bytes) -> dict:
    img = Image.open(io.BytesIO(image_bytes))
    exif_data = img.getexif()
    result = {"datetime": None, "gps_lat": None, "gps_lng": None}

    if exif_data:
        for tag_id, value in exif_data.items():
            tag_name = ExifTags.TAGS.get(tag_id, tag_id)
            if tag_name == "DateTimeOriginal" and isinstance(value, str):
                try:
                    result["datetime"] = datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
                except ValueError:
                    pass
            elif tag_name == "GPSInfo" and isinstance(value, dict):
                gps = {}
                for gps_tag_id, gps_value in value.items():
                    gps_tag = ExifTags.GPSTAGS.get(gps_tag_id, gps_tag_id)
                    gps[gps_tag] = gps_value
                result["gps_lat"] = _gps_to_decimal(gps.get("GPSLatitude"), gps.get("GPSLatitudeRef"))
                result["gps_lng"] = _gps_to_decimal(gps.get("GPSLongitude"), gps.get("GPSLongitudeRef"))

    return result


def _gps_to_decimal(coords, ref) -> float | None:
    if not coords:
        return None
    degrees, minutes, seconds = coords
    decimal = float(degrees) + float(minutes) / 60.0 + float(seconds) / 3600.0
    if ref and ref in ("S", "W"):
        decimal = -decimal
    return round(decimal, 6)


def verify_photo_time(exif_dt: datetime | None) -> dict:
    if not exif_dt:
        return {"valid": False, "error": "No timestamp in photo"}
    now = datetime.now(timezone.utc)
    drift = abs((now - exif_dt.replace(tzinfo=timezone.utc)).total_seconds())
    if drift > MAX_TIME_DRIFT_SECONDS:
        return {"valid": False, "error": f"Photo timestamp is off by {drift:.0f}s (max {MAX_TIME_DRIFT_SECONDS}s)"}
    return {"valid": True, "drift_seconds": round(drift)}


def verify_photo_location(exif_lat: float | None, exif_lng: float | None, site_lat: float, site_lng: float, radius_m: float) -> dict:
    if exif_lat is None or exif_lng is None:
        return {"valid": False, "error": "No GPS data in photo"}
    from math import radians, sin, cos, sqrt, atan2
    R = 6371000
    lat1, lon1 = radians(exif_lat), radians(exif_lng)
    lat2, lon2 = radians(site_lat), radians(site_lng)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    distance = R * 2 * atan2(sqrt(a), sqrt(1 - a))
    if distance > radius_m:
        return {"valid": False, "error": f"Photo location is {distance:.0f}m away (max {radius_m:.0f}m)"}
    return {"valid": True, "distance_meters": round(distance)}
