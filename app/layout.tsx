import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/providers/auth-provider"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"
import Provider from "./provider"
import { UserProvider } from "@/context/user-context"
import { ChatBot } from "@/components/ChatBot/ChatBot"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Campus Communication Platform",
  description: "A modern platform for campus communication",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Provider>
          <UserProvider>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
                <Toaster />
                <ChatBot />
              </ThemeProvider>
            </AuthProvider>
          </UserProvider>
        </Provider>
      </body>
    </html>
  )
}
