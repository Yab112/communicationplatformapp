"use client"


import { navigationItems } from "@/app/constants"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"



export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="w-80"> 
      <SidebarContent>
        <div className="flex h-16 items-center px-6 font-semibold"> {/* Increased height */}
          <span className="text-2xl text-primary">UniConnect</span> {/* Increased font size */}
        </div>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                  pathname === item.href
                    ? "bg-primary text-white" 
                    : "hover:bg-gray-100 text-gray-700" 
                }`}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-6 w-6" /> {/* Increased icon size */}
                  <span className="text-sm">{item.name}</span> {/* Increased text size */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
