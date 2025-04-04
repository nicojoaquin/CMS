import { apiClient } from "../axios";

export type UploadResponse = {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
};

export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<UploadResponse>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await apiClient.delete("/upload", {
      params: { url },
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}
