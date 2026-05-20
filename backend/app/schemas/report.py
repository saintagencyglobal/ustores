from datetime import datetime
from pydantic import BaseModel


class PhotoReportIn(BaseModel):
    report_type: str
    comment: str | None = None


class PhotoReportOut(BaseModel):
    id: str
    user_id: str
    report_type: str
    photo_url: str
    comment: str | None = None
    verified_time: bool
    verified_location: bool
    verification_error: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
