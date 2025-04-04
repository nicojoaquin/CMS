import { FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import Input from "@/components/input";
import { loginSchema } from "../../lib/auth/schemas";
import { LoginFormValues } from "../../lib/auth/types";
import FormErrorMessage from "@/components/form-error-message";
import { GetServerSideProps } from "next";
import { getServerSession } from "@/lib/auth/config";
import { toWebHeaders } from "@/lib/api/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthentication } from "@/lib/auth/hooks/useAuthentication";

export default function LoginPage() {
  const router = useRouter();
  const { methods, error, signIn } = useAuthentication(loginSchema);
  const queryClient = useQueryClient();

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signIn(data);
    if (result.success) {
      queryClient.clear();
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full px-4 sm:px-0">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-[#3E2723] mb-6 text-center">
            Welcome Back
          </h1>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <Input name="email" label="Email" />
              <Input name="password" label="Password" type="password" />

              {error && <FormErrorMessage message={error} />}

              <button
                type="submit"
                className="w-full bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </button>

              <div className="mt-4 text-center">
                <p className="text-[#5D4037] font-medium">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-[#795548] hover:underline font-semibold"
                  >
                    Sign Up
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
