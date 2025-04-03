import { GetServerSideProps } from "next";

export default function Home() {
  // This component won't actually render since we're redirecting at the server level
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/dashboard",
      permanent: false,
    },
  };
};
