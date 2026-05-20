from pydantic import BaseModel


class SendOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    code: str
    name: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str
    phone: str


class UserOut(BaseModel):
    id: str
    phone: str
    name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
