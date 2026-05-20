from datetime import datetime
from pydantic import BaseModel


class AttendanceIn(BaseModel):
    type: str  # "in" or "out"


class AttendanceOut(BaseModel):
    id: str
    user_id: str
    type: str
    time: datetime

    class Config:
        from_attributes = True


class TodayStats(BaseModel):
    checked_in: bool
    checked_out: bool
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None


class DailySummary(BaseModel):
    date: str
    check_in: datetime | None = None
    check_out: datetime | None = None
    hours: float | None = None
