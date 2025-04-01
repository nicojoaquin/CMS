import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import { useState } from "react";
import Input from "@/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./lib/schemas";
import { LoginFormValues } from "./lib/types";
import { authClient } from "@/lib/auth/client";

export default function RegisterPage() {
  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message!);
      return;
    }
    router.push("/app");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Input name="email" label="Email" />
          <Input name="password" label="Password" type="password" />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sign Up
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
