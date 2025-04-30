"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, User, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { mockStudents } from "@/data/mock/users"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface StudentsListProps {
  roomId: string
  onOpenProfile?: (userId: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function StudentsList({ roomId, onOpenProfile }: StudentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const confirmStartDM = () => {
    const student = mockStudents.find((s) => s.id === selectedStudent)
    if (student) {
      toast({
        title: "Direct message created",
        description: `You can now chat with ${student.name}`,
      })
      setShowConfirmDialog(false)
    }
  }

  return (
    <>
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
                  <Avatar
                    className="h-10 w-10 cursor-pointer hover:opacity-80"
                    onClick={() => handleViewProfile(student.id)}
                  >
                    <AvatarImage src={student.avatar || "/placeholder.svg?height=40&width=40"} alt={student.name} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
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
                        className={`h-2 w-2 rounded-full mr-1 ${student.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                      ></span>
                      <span className="text-xs text-muted-foreground">
                        {student.status === "online" ? "Online" : "Offline"}
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
                      <User className="h-4 w-4" />
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
                </motion.div>
              ))
            )}
          </motion.div>
        </ScrollArea>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start new conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {selectedStudent &&
                `Start a direct message with ${mockStudents.find((s) => s.id === selectedStudent)?.name}?`}
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
    </>
  )
}
