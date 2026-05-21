from datetime import datetime
from pydantic import BaseModel


class AttendanceOut(BaseModel):
    id: str
    user_id: str
    type: str
    time: datetime
    photo_url: str | None = None
    verified_time: bool = False
    verified_location: bool = False
    verification_error: str | None = None

    class Config:
        from_attributes = True


class TodayStats(BaseModel):
    check_in: datetime | None = None
    check_out: datetime | None = None
    cleaning: datetime | None = None
    collection: datetime | None = None
    checked_in: bool = False
    checked_out: bool = False


class DailySummary(BaseModel):
    date: str
    check_in: datetime | None = None
    check_out: datetime | None = None
    hours: float | None = None
