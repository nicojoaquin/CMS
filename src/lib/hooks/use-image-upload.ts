import { useState, useEffect } from "react";
import { UploadResponse } from "@/lib/services/upload";

export type UseImageUploadProps = {
  initialImage?: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: unknown) => void;
};

export function useImageUpload(options: UseImageUploadProps = {}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageResponse, setImageResponse] = useState<UploadResponse | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

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

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setError(null);

    if (!file) setImageResponse(null);
  };

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
    reset,
  };
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
}
