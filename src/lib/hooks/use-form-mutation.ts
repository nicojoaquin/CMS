import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

export type FormError = {
  message: string;
  field?: string;
};

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

type UseFormMutationOptions<TData, TInput> = {
  defaultValues?: Partial<TInput>;
  onSuccess?: (data: TData) => void;
  successMessage?: string;
};

export function useFormMutation<TInput, TData>(
  schema: z.ZodType<TInput>,
  mutation: UseMutationResult<TData, Error, TInput>,
  options?: UseFormMutationOptions<TData, TInput>
) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const methods = useForm<TInput>({
    resolver: zodResolver(schema),
    defaultValues: options?.defaultValues,
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    setGeneralError(null);

    try {
      const result = await mutation.mutateAsync(data);

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      return { success: true, data: result };
    } catch (err) {
      // Handle API errors
      if (isApiError(err)) {
        const message = err.message || "An error occurred. Please try again.";

        // Check if the error is tied to a specific field
        if (
          err.field &&
          typeof data === "object" &&
          data !== null &&
          err.field in data
        ) {
          methods.setError(err.field as any, {
            type: "server",
            message,
          });
        } else {
          setGeneralError(message);
          toast.error(message);
        }
      } else {
        const message =
          err instanceof Error
            ? err.message
            : "An error occurred. Please try again.";
        setGeneralError(message);
        toast.error(message);
      }

      return { success: false };
    }
  });

  return {
    methods,
    handleSubmit,
    isPending: mutation.isPending,
    generalError,
    setGeneralError,
  };
}
