from pydantic import BaseModel


class WorkSiteOut(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    radius_meters: float

    class Config:
        from_attributes = True


class WorkSiteIn(BaseModel):
    name: str
    latitude: float
    longitude: float
    radius_meters: float = 100.0
