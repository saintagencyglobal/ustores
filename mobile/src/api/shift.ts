import client from "./client";

export async function shiftAction(action: "open" | "close", photoUri?: string) {
  const formData = new FormData();
  formData.append("action", action);
  if (photoUri) {
    formData.append("photo", {
      uri: photoUri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);
  }
  const res = await client.post("/shift/action", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getTodayShift() {
  const res = await client.get("/shift/today");
  return res.data;
}
