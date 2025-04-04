import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { formatFileSize, isImageFile } from "@/lib/hooks/use-image-upload";
import Image from "next/image";

type Props = {
  onImageSelected: (file: File | null) => void;
  currentImageUrl?: string;
  className?: string;
  isUploading?: boolean;
  errorMessage?: string;
  required?: boolean;
};

const ImageUpload = ({
  onImageSelected,
  currentImageUrl,
  className = "",
  isUploading = false,
  errorMessage,
  required = false,
}: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!isImageFile(file)) {
        alert("Please select a valid image file (JPG, PNG, GIF, etc.)");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      setFileInfo({
        name: file.name,
        size: file.size,
      });

      onImageSelected(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setFileInfo(null);
    onImageSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isExistingImage =
    previewUrl === currentImageUrl && currentImageUrl && !fileInfo;

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        data-testid="image-upload-input"
        required={required && !previewUrl}
      />

      {previewUrl ? (
        <div className="relative">
          <Image
            width={500}
            height={200}
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-md"
          />
          {fileInfo && !isUploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-md">
              <div className="truncate">{fileInfo.name}</div>
              <div>{formatFileSize(fileInfo.size)}</div>
            </div>
          )}
          {isExistingImage && !isUploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-md">
              <div className="truncate">Current image</div>
            </div>
          )}
          {errorMessage && (
            <div className="absolute bottom-0 left-0 right-0 bg-[#C62828] bg-opacity-90 text-white text-xs p-2 rounded-b-md">
              {errorMessage}
            </div>
          )}
          <button
            type="button"
            onClick={handleRemoveImage}
            className={`absolute top-2 right-2 ${
              required ? "bg-gray-400" : "bg-[#C62828]"
            } text-white p-1 rounded-full ${
              required ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            aria-label="Remove image"
            disabled={isUploading || required}
            title={required ? "This image is required" : "Remove image"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={triggerFileInput}
            className="absolute top-2 left-2 bg-[#5D4037] text-white p-1 rounded-full cursor-pointer"
            aria-label="Change image"
            disabled={isUploading}
            title="Change image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className="border-2 border-dashed border-[#D7CCC8] rounded-md p-6 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-[#8D6E63] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[#8D6E63]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-[#5D4037] font-medium">
            Click to upload an image
            {required && <span className="text-[#C62828]">*</span>}
          </p>
          <p className="mt-1 text-xs text-[#8D6E63]">
            JPG, PNG, GIF up to 10MB
          </p>
          {errorMessage && (
            <div className="mt-2 text-[#C62828] text-xs font-medium bg-[#FFEBEE] p-2 rounded">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
