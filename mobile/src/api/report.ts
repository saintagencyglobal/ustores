import { getToken } from "../store/auth";
import client from "./client";

export async function createPhotoReport(
  reportType: "cleaning" | "collection",
  photoUri: string,
  comment?: string
) {
  const token = await getToken();
  const formData = new FormData();
  formData.append("report_type", reportType);
  formData.append("photo", {
    uri: photoUri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);
  if (comment) {
    formData.append("comment", comment);
  }
  const res = await fetch(`${client.defaults.baseURL}/report/photo`, {
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

export async function getMyReports(reportType?: string) {
  const params: Record<string, string> = {};
  if (reportType) params.report_type = reportType;
  const res = await client.get("/report/photos", { params });
  return res.data;
}
