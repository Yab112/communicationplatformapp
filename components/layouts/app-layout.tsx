"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Make sure the AppLayout component is properly structured for authenticated routes only
  // No need to check authentication here as middleware handles that
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <Sidebar isMobile={isMobile} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Fixed Header */}
        <div className="sticky top-0 z-30">
          <Header />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
