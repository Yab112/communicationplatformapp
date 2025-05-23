"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, User as UserIcon, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getStudents } from "@/lib/actions/users"
import { createDirectMessage } from "@/lib/actions/chat"
import type { User } from "@/types/user"

interface StudentsListProps {
  roomId: string
  onOpenProfile?: (userId: string) => void
  onRoomCreated?: (roomId: string) => void
}

export function StudentsList({ roomId, onOpenProfile, onRoomCreated }: StudentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await getStudents()
      if ('error' in data) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
        return
      }
      setStudents(data)
      console.log("students list is this",data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.department?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  const handleStartDM = (studentId: string) => {
    setSelectedStudent(studentId)
    setShowConfirmDialog(true)
  }

  const handleViewProfile = (studentId: string) => {
    if (onOpenProfile) {
      onOpenProfile(studentId)
    }
  }

  const confirmStartDM = async () => {
    if (!selectedStudent) return

    try {
      const result = await createDirectMessage(selectedStudent)

      if ('error' in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      const student = students.find((s) => s.id === selectedStudent)
      toast({
        title: "Direct message created",
        description: `You can now chat with ${student?.name}`,
      })

      if (onRoomCreated && result.chatRoom) {
        onRoomCreated(result.chatRoom.id)
      }

      setShowConfirmDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create direct message",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-primary/20 p-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">Students</h2>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[50vh]">
        <motion.div className="space-y-3 pr-4" variants={container} initial="hidden" animate="show">
          {filteredStudents.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No students found</div>
          ) : (
            filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                className="flex items-center gap-3 rounded-lg border border-primary/20 p-3"
                variants={item}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    className="h-10 w-10 cursor-pointer hover:opacity-80"
                    onClick={() => handleViewProfile(student.id)}
                  >
                    <AvatarImage src={student.image || "/placeholder.svg?height=40&width=40"} alt={student.name || "User"} />
                    <AvatarFallback>{(student.name || "U").charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => handleViewProfile(student.id)}
                    >
                      {student.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{student.department}</p>
                    <div className="flex items-center mt-1">
                      <span
                        className={`h-2 w-2 rounded-full mr-1 ${student.status === "ONLINE" ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {student.status === "ONLINE" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleViewProfile(student.id)}
                    >
                      <UserIcon className="h-4 w-4" />
                      <span className="sr-only">View profile</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleStartDM(student.id)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </ScrollArea>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start new conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {selectedStudent &&
                `Start a direct message with ${students.find((s) => s.id === selectedStudent)?.name}?`}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStartDM} className="bg-primary hover:bg-primary/90">
              Start Conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
