"use client"

import { motion } from "framer-motion"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigationItems } from "@/app/constants"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()

  const renderNavItem = (item: { name: string; href: string; icon: any; badge?: string }) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton 
        asChild 
        isActive={pathname === item.href} 
        tooltip={item.name}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          pathname === item.href && "bg-primary/10"
        )}
      >
        <Link href={item.href} className="flex items-center gap-3 py-2">
          <div className={cn(
            "flex items-center justify-center rounded-md p-2 transition-colors",
            pathname === item.href 
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
          )}>
            <item.icon className="h-5 w-5" />
          </div>
          <span className={cn(
            "font-medium transition-colors flex-1",
            pathname === item.href 
              ? "text-primary"
              : "text-muted-foreground group-hover:text-primary"
          )}>
            {item.name}
          </span>
          {item.badge && (
            <span className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              {item.badge}
            </span>
          )}
          {pathname === item.href && (
            <motion.div
              layoutId="activeNavItem"
              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex h-16 items-center px-6">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
          >
            UniConnect
          </motion.span>
        </div>
        <SidebarMenu>
          {navigationItems.map((section, index) => (
            <div key={section.name}>
              {index > 0 && (
                <SidebarSeparator className="my-4" />
              )}
              <div className="mb-2 px-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.name}
                </h2>
              </div>
              {section.items.map(renderNavItem)}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
