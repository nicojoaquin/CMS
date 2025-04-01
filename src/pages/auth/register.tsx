import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import { useState } from "react";
import Input from "@/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "./lib/schemas";
import { RegisterFormValues } from "./lib/types";
import { authClient } from "@/lib/auth/client";

export default function RegisterPage() {
  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: "Nico",
    });
    if (error) {
      setError(error.message!);
      return;
    }
    router.push("/app");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Input name="fullName" label="Full Name" />
          <Input name="email" label="Email" />
          <Input name="password" label="Password" type="password" />
          <Input
            name="repeatPassword"
            label="Enter your password again"
            type="password"
          />
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
