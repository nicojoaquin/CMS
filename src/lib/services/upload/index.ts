import { apiClient } from "../axios";

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Upload a file to the server using apiClient
 * @param file The file to upload
 * @returns A promise resolving to the upload response
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Use apiClient for consistent error handling
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

/**
 * Delete a file from the server using its URL
 * @param url The URL of the file to delete
 */
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
