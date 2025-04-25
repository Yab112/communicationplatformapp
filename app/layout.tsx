"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/Feeds/top-bar"; // Import the TopBar component
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex h-screen">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <TopBar />

              {/* Page Content */}
              <main className="flex-1 p-4">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}