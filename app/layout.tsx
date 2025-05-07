import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/providers/auth-provider"
import { SocketProvider } from "@/providers/socket-provider"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"
import Provider from "./provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UniConnect",
  description: "University social platform for students and faculty",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Provider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <SocketProvider>
                {children}
                <Toaster />
              </SocketProvider>
            </ThemeProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  )
}
