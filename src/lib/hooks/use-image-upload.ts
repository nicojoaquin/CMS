import { useState, useEffect } from "react";
import { uploadFile, UploadResponse } from "@/lib/services/upload";
import { showErrorToast } from "@/lib/hooks/use-toast";

export interface UseImageUploadOptions {
  initialImage?: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: unknown) => void;
}

export interface UseImageUploadResult {
  selectedFile: File | null;
  isUploading: boolean;
  imageResponse: UploadResponse | null;
  error: Error | null;
  handleFileSelected: (file: File | null) => void;
  uploadSelectedFile: (file?: File) => Promise<UploadResponse | null>;
  reset: () => void;
}

/**
 * Custom hook for handling image uploads
 *
 * This hook manages the state and logic for selecting and uploading images
 */
export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadResult {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageResponse, setImageResponse] = useState<UploadResponse | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

  // Set initial image response if provided
  useEffect(() => {
    if (options.initialImage && !imageResponse) {
      setImageResponse({
        url: options.initialImage,
        filename: options.initialImage.split("/").pop() || "existing-image",
        size: 0,
        mimetype: "image/jpeg",
      });
    }
  }, [options.initialImage, imageResponse]);

  // Handle when a file is selected
  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setError(null);

    // If file is null (user removed the image), clear the response
    if (!file) {
      setImageResponse(null);
    }
    // Note: We no longer auto-upload the file when selected
  };

  // Upload the selected file
  const uploadSelectedFile = async (file: File = selectedFile!) => {
    if (!file) return null;

    try {
      setIsUploading(true);
      setError(null);

      const response = await uploadFile(file);
      setImageResponse(response);
      options?.onSuccess?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Upload failed");
      setError(error);
      showErrorToast(error);
      options?.onError?.(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Reset the state
  const reset = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setImageResponse(null);
    setError(null);
  };

  return {
    selectedFile,
    isUploading,
    imageResponse,
    error,
    handleFileSelected,
    uploadSelectedFile,
    reset,
  };
}

/**
 * Extract file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Check if a file is an image based on its type
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Format bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
}
