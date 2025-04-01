import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, registerSchema } from "../schemas";
import { z } from "zod";
import { authClient } from "@/lib/auth/client";

type FormSchemas = typeof registerSchema | typeof loginSchema;

export const useAuthentication = <SchemaT extends FormSchemas>(
  schema: SchemaT
) => {
  const methods = useForm<z.infer<SchemaT>>({
    resolver: zodResolver(schema),
  });

  const [error, setError] = useState<string | null>(null);

  const signUp = async (data: z.infer<typeof registerSchema>) => {
    setError(null);

    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.fullName,
    });

    if (error) {
      setError(error.message || "An unknown error occurred");
      return { success: false };
    }

    return { success: true };
  };

  const signIn = async (data: z.infer<typeof loginSchema>) => {
    setError(null);

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message!);
      return { success: false };
    }

    return { success: true };
  };

  return { methods, error, signUp, signIn };
};
