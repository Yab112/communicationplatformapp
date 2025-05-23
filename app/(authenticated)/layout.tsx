import type React from "react"
import { requireAuth } from "@/lib/get-session"
import { AppLayout } from "@/components/layouts/app-layout"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check
  await requireAuth()

  return <AppLayout>{children}</AppLayout>
}
