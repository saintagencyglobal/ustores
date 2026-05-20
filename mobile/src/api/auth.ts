import client from "./client";

export async function sendOtp(phone: string) {
  const res = await client.post("/auth/send-otp", { phone });
  return res.data;
}

export async function verifyOtp(phone: string, code: string, name?: string) {
  const res = await client.post("/auth/verify-otp", { phone, code, name });
  return res.data;
}
