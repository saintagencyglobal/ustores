from datetime import datetime
from pydantic import BaseModel


class ShiftIn(BaseModel):
    action: str  # "open" or "close"


class ShiftOut(BaseModel):
    id: str
    user_id: str
    action: str
    time: datetime
    photo_url: str | None = None

    class Config:
        from_attributes = True
