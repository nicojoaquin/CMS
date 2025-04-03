import { QueryProvider } from "@/lib/query/provider";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#3E2723",
            border: "1px solid #D7CCC8",
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: "#5D4037",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#B71C1C",
              secondary: "#fff",
            },
            style: {
              background: "#FFEBEE",
              color: "#B71C1C",
              border: "1px solid #FFCDD2",
            },
          },
        }}
      />
    </QueryProvider>
  );
}
