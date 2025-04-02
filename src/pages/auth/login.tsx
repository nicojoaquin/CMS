import { FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import Input from "@/components/input";
import { loginSchema } from "./lib/schemas";
import { LoginFormValues } from "./lib/types";
import FormErrorMessage from "@/components/form-error-message";
import { useAuthentication } from "./lib/hooks/useAuthentication";

export default function RegisterPage() {
  const router = useRouter();
  const { methods, error, signIn } = useAuthentication(loginSchema);

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signIn(data);
    if (result.success) router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Input name="email" label="Email" />
          <Input name="password" label="Password" type="password" />
          {error && <FormErrorMessage message={error} />}
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
