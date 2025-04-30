"use client"

import { useState } from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ResourcesTabs } from "@/components/chat/resources-tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { StudentsList } from "./students-list"
import { TeachersList } from "./teachers-list"
import { ChatRoom } from "@/types/chat"

interface RoomOptionsMenuProps {
  room: ChatRoom
  onOpenProfile?: (userId: string) => void
}

type ActivePanel = "teachers" | "students" | "resources" | null

export function RoomOptionsMenu({ room, onOpenProfile }: RoomOptionsMenuProps) {
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
            <span className="sr-only">Room options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem onClick={() => handleOpenPanel("teachers")}>View Teachers</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPanel("students")}>View Students</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenPanel("resources")}>View Resources</DropdownMenuItem>
          <DropdownMenuItem>Add Poll</DropdownMenuItem>
          <DropdownMenuItem>Schedule Group Meet</DropdownMenuItem>
          {isAdmin && <DropdownMenuItem className="text-destructive">Report Room</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Teachers Panel - Changed to Dialog */}
      <Dialog open={activePanel === "teachers"} onOpenChange={handleClosePanel}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <TeachersList roomId={room.id} onOpenProfile={onOpenProfile} />
        </DialogContent>
      </Dialog>

      {/* Students Panel - Changed to Dialog */}
      <Dialog open={activePanel === "students"} onOpenChange={handleClosePanel}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <StudentsList roomId={room.id} onOpenProfile={onOpenProfile} />
        </DialogContent>
      </Dialog>

      {/* Resources Panel */}
      <Dialog open={activePanel === "resources"} onOpenChange={handleClosePanel}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
          <ResourcesTabs roomId={room.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}
