"use client";

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Needs to be > 0 to avoid re-fetching on initial load
            staleTime: 60,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
