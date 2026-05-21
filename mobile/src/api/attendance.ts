import { getToken } from "../store/auth";
import client from "./client";

export async function checkInOut(type: "in" | "out", photoUri: string) {
  const token = await getToken();
  const formData = new FormData();
  formData.append("type", type);
  formData.append("photo", {
    uri: photoUri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);
  const res = await fetch(`${client.defaults.baseURL}/attendance/check`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { response: { data: err, status: res.status }, message: res.statusText };
  }
  return res.json();
}

export async function getTodayStats() {
  const res = await client.get("/attendance/today");
  return res.data;
}

export async function getMonthStats(year?: number, month?: number) {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  if (month) params.month = month;
  const res = await client.get("/attendance/month", { params });
  return res.data;
}
