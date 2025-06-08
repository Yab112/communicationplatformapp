// app/(authenticated)/layout.tsx (Corrected)
import type React from "react";
import { requireAuth } from "@/lib/get-session";
import { AppLayout } from "@/components/layouts/app-layout";
import { SocketProvider } from "@/providers/socket-provider"; // Ensure this is imported

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <SocketProvider>
      <AppLayout>{children}</AppLayout>
    </SocketProvider>
  );
}