"use client"

import { useState } from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ResourcesTabs } from "@/components/chat/resources-tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ChatRoom } from "@/types/chat"
import { TeachersList } from "./teachers-list"
import { StudentsList } from "./students-list"

interface RoomOptionsProps {
  room: ChatRoom
}

type ActivePanel = "teachers" | "students" | "resources" | null

export function RoomOptions({ room }: RoomOptionsProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const isAdmin = true // Mock admin status

  const handleOpenPanel = (panel: ActivePanel) => {
    setActivePanel(panel)
  }

  const handleClosePanel = () => {
    setActivePanel(null)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleOpenPanel("teachers")}>View Teachers</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPanel("students")}>View Students</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPanel("resources")}>View Resources</DropdownMenuItem>
          <DropdownMenuItem>Add Poll</DropdownMenuItem>
          <DropdownMenuItem>Schedule Group Meet</DropdownMenuItem>
          {isAdmin && <DropdownMenuItem className="text-[var(--color-error)]">Report Room</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Teachers Panel */}
      <Sheet open={activePanel === "teachers"} onOpenChange={handleClosePanel}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <TeachersList roomId={room.id} />
        </SheetContent>
      </Sheet>

      {/* Students Panel */}
      <Sheet open={activePanel === "students"} onOpenChange={handleClosePanel}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <StudentsList roomId={room.id} />
        </SheetContent>
      </Sheet>

      {/* Resources Panel */}
      <Dialog open={activePanel === "resources"} onOpenChange={handleClosePanel}>
        <DialogContent className="sm:max-w-[700px]">
          <ResourcesTabs roomId={room.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}
