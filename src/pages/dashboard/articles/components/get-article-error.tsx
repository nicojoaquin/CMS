import Link from "next/link";

type Props = {
  message?: string;
};

const GetArticleError = ({ message }: Props) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center">
      <div className="bg-[#FFEBEE] text-[#B71C1C] p-8 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="font-medium">{message || "Failed to load article"}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default GetArticleError;
