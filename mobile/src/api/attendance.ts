import client from "./client";

export async function checkInOut(type: "in" | "out", photoUri: string) {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("photo", {
    uri: photoUri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);
  const res = await client.post("/attendance/check", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
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
