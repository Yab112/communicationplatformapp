"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockStudents, mockTeachers } from "@/data/mock/users"
import type { User } from "@/types/user"

export function UsersSidebar() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("students")

  const renderUserList = (users: User[]) => (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="space-y-2 p-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--color-muted)]/10">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || "/placeholder.svg?height=32&width=32"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-[var(--color-muted-fg)]">{user.department}</p>
            </div>
            <div
              className={`h-2 w-2 rounded-full ${user.status === "online" ? "bg-[var(--color-success)]" : "bg-[var(--color-muted-fg)]/30"}`}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  )

  return (
    <div className="hidden w-72 xl:w-80 border-l border-[var(--color-border)] bg-[var(--color-card)] lg:block">
      <div className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Community</h3>
        <Tabs defaultValue="students" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-blue-100/50 data-[state=active]:bg-blue-500/40">
            <TabsTrigger value="students" >Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
          </TabsList>
          <TabsContent value="students">{renderUserList(mockStudents)}</TabsContent>
          <TabsContent value="teachers">{renderUserList(mockTeachers)}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
