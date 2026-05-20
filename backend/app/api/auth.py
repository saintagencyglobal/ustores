from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.schemas.user import SendOtpRequest, VerifyOtpRequest, TokenResponse
from app.utils.sms import generate_otp, send_sms, verify_otp
from app.utils.auth import create_access_token

router = APIRouter()


@router.post("/send-otp")
async def send_otp(req: SendOtpRequest):
    code = generate_otp()
    ok = await send_sms(req.phone, code)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to send SMS")
    return {"message": "OTP sent", "code": code if not ok else None}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_endpoint(req: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    if not verify_otp(req.phone, req.code):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    result = await db.execute(select(User).where(User.phone == req.phone))
    user = result.scalar_one_or_none()

    if not user:
        if not req.name:
            raise HTTPException(status_code=400, detail="Name is required for registration")
        user = User(phone=req.phone, name=req.name)
        db.add(user)
        await db.flush()

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        name=user.name,
        role=user.role,
        phone=user.phone,
    )
