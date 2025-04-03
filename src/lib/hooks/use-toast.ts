import toast from "react-hot-toast";

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}

export const showErrorToast = (error: unknown): string => {
  let message = "An error occurred. Please try again.";

  if (isApiError(error)) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
  return message;
};

export const showSuccessToast = (message: string): void => {
  toast.success(message);
};
