"use client"

import { useState } from "react"
import { MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ResourcesTabs } from "@/components/chat/resources-tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { StudentsList } from "./students-list"
import { TeachersList } from "./teachers-list"
import { ChatRoom } from "@/types/chat"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RoomOptionsMenuProps {
  room: ChatRoom
  onOpenProfile?: (userId: string) => void
  onDelete?: () => Promise<void>
  onSelect?: (room: ChatRoom) => void
}

type ActivePanel = "teachers" | "students" | "resources" | null

export function RoomOptionsMenu({ room, onOpenProfile, onDelete, onSelect }: RoomOptionsMenuProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const isAdmin = true // Mock admin status

  const handleOpenPanel = (panel: ActivePanel) => {
    setActivePanel(panel)
  }

  const handleClosePanel = () => {
    setActivePanel(null)
  }

  const handleDelete = async () => {
    if (!onDelete) return

    try {
      setIsDeleting(true)
      await onDelete()
      toast({
        title: "Success",
        description: "Room deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
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
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Room</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Report Room</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Teachers Panel */}
      <Dialog open={activePanel === "teachers"} onOpenChange={handleClosePanel}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <TeachersList onSelect={(roomId) => {
            if (onSelect) {
              // Find the room in the current room's users
              const selectedUser = room.users.find(u => u.user.id === roomId);
              if (selectedUser) {
                onSelect({
                  ...room,
                  id: roomId,
                  name: selectedUser.user.name,
                  users: [selectedUser]
                });
              }
            }
            handleClosePanel();
          }} />
        </DialogContent>
      </Dialog>

      {/* Students Panel */}
      <Dialog open={activePanel === "students"} onOpenChange={handleClosePanel}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
          <StudentsList onSelect={(roomId) => {
            if (onSelect) {
              // Find the room in the current room's users
              const selectedUser = room.users.find(u => u.user.id === roomId);
              if (selectedUser) {
                onSelect({
                  ...room,
                  id: roomId,
                  name: selectedUser.user.name,
                  users: [selectedUser]
                });
              }
            }
            handleClosePanel();
          }} />
        </DialogContent>
      </Dialog>

      {/* Resources Panel */}
      <Dialog open={activePanel === "resources"} onOpenChange={handleClosePanel}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
          <ResourcesTabs roomId={room.id} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat room
              and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
