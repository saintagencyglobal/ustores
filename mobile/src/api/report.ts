import client from "./client";

export async function createPhotoReport(
  reportType: "cleaning" | "collection",
  photoUri: string,
  comment?: string
) {
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
  const res = await client.post("/report/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getMyReports(reportType?: string) {
  const params: Record<string, string> = {};
  if (reportType) params.report_type = reportType;
  const res = await client.get("/report/photos", { params });
  return res.data;
}
