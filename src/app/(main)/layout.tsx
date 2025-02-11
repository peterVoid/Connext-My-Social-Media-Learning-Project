"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RightSection from "./RightSection";

const queryClient = new QueryClient();

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <main className="flex min-h-screen flex-grow">
          <Sidebar />
          <div className="ml-14 flex-1 md:ml-56">{children}</div>
          <div className="hidden border-l border-white/20 md:block md:w-[30%]">
            <RightSection />
          </div>
        </main>
      </SessionProvider>
    </QueryClientProvider>
  );
}
