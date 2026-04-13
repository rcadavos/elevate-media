"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "next-themes";

function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 3,
      },
      mutations: {
        retry: 3,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createAppQueryClient);

  // React 19: next-themes injects an inline <script> for no-flash theme; the client
  // warns unless the script is non-executable (see pacocoursey/next-themes#387).
  const themeScriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        themes={["light", "dark"]}
        disableTransitionOnChange
        scriptProps={themeScriptProps}
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
