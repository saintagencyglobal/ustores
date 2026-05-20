import random
import httpx
from app.config import settings


sms_storage: dict[str, str] = {}


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


async def send_sms(phone: str, code: str) -> bool:
    if not settings.SMS_API_KEY:
        sms_storage[phone] = code
        return True

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.sms-provider.com/send",
            json={
                "api_key": settings.SMS_API_KEY,
                "from": settings.SMS_FROM,
                "to": phone,
                "text": f"Your verification code: {code}",
            },
        )
        return resp.is_success


def verify_otp(phone: str, code: str) -> bool:
    stored = sms_storage.get(phone)
    if not stored:
        return False
    return stored == code
