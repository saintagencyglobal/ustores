from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.api import auth, attendance, shift, report, work_site, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Attendance App", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(shift.router, prefix="/api/shift", tags=["Shift"])
app.include_router(report.router, prefix="/api/report", tags=["Report"])
app.include_router(work_site.router, prefix="/api/work-sites", tags=["Work Sites"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
