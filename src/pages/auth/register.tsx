import { FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import Input from "@/components/input";
import { registerSchema } from "./lib/schemas";
import { RegisterFormValues } from "./lib/types";
import { useAuthentication } from "./lib/hooks/useAuthentication";
import FormErrorMessage from "@/components/form-error-message";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { methods, error, signUp } = useAuthentication(registerSchema);

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await signUp(data);
    if (result.success) router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full px-4 sm:px-0">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-[#3E2723] mb-6 text-center">
            Create Your Account
          </h1>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <Input name="fullName" label="Full Name" />
              <Input name="email" label="Email" />
              <Input name="password" label="Password" type="password" />
              <Input
                name="repeatPassword"
                label="Confirm Password"
                type="password"
              />

              {error && <FormErrorMessage message={error} />}

              <button
                type="submit"
                className="w-full bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </button>

              <div className="mt-4 text-center">
                <p className="text-[#5D4037] font-medium">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-[#795548] hover:underline font-semibold"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession({
    headers: toWebHeaders(context.req.headers),
  });

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
