import { FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import Input from "@/components/input";
import { registerSchema } from "./lib/schemas";
import { RegisterFormValues } from "./lib/types";
import { useAuthentication } from "./lib/hooks/useAuthentication";
import FormErrorMessage from "@/components/form-error-message";

export default function RegisterPage() {
  const router = useRouter();
  const { methods, error, signUp } = useAuthentication(registerSchema);

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await signUp(data);
    if (result.success) router.push("/app");
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
