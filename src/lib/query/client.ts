import { QueryClient } from "@tanstack/react-query";

// Create a QueryClient with improved settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Very short stale time to ensure frequent refreshes (5 seconds)
      staleTime: 5 * 1000,
      // Cache time of 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed queries 2 times
      retry: 2,
      // Custom retry delay that increases with each attempt
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Always refetch on window focus for better user experience
      refetchOnWindowFocus: true,
      // Refetch on reconnect for better mobile experience
      refetchOnReconnect: true,
      // Always refetch when component mounts
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once to handle network glitches
      retry: 1,
    },
  },
});
