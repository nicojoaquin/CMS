import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authClient } from "@/lib/auth/client";
import { queryClient } from "@/lib/query/client";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = authClient.useSession();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    // Clear the query cache to prevent data leakage between sessions
    queryClient.clear();

    // Sign out using the auth client
    await authClient.signOut();

    // Navigate to login page
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/dashboard"
                className="text-xl font-semibold text-[#5D4037] cursor-pointer"
              >
                CMS Dashboard
              </Link>
            </div>
          </div>

          <div className="flex items-center flex-1 max-w-xl mx-auto px-4">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles... (press Enter to search)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8D6E63] focus:border-[#8D6E63] text-[#3E2723] font-medium"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center px-3 bg-[#5D4037] hover:bg-[#4E342E] text-white rounded-r-md transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <div className="ml-4 flex items-center md:ml-6 space-x-2">
              {session && (
                <span className="text-[#5D4037] font-medium hidden md:block">
                  {session.user.name || session.user.email}
                </span>
              )}
              <Link
                href="/dashboard/articles/new"
                className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                Create Article
              </Link>
              <button
                onClick={handleLogout}
                className="bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#5D4037] px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
