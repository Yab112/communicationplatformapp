"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, User, Search } from "lucide-react"
import { motion } from "framer-motion"
import { mockTeachers } from "@/data/mock/users"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface TeachersListProps {
  roomId: string
  onOpenProfile?: (userId: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TeachersList({ roomId, onOpenProfile }: TeachersListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  const filteredTeachers = mockTeachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const handleStartDM = (teacherId: string) => {
    setSelectedTeacher(teacherId)
    setShowConfirmDialog(true)
  }

  const handleViewProfile = (teacherId: string) => {
    if (onOpenProfile) {
      onOpenProfile(teacherId)
    }
  }

  const confirmStartDM = () => {
    const teacher = mockTeachers.find((t) => t.id === selectedTeacher)
    if (teacher) {
      toast({
        title: "Direct message created",
        description: `You can now chat with ${teacher.name}`,
      })
      setShowConfirmDialog(false)
    }
  }

  return (
    <>
      <div className="py-4">
        <h2 className="text-xl font-semibold mb-4">Teachers</h2>

        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search teachers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[50vh]">
          <motion.div className="space-y-4 pr-4" variants={container} initial="hidden" animate="show">
            {filteredTeachers.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No teachers found</div>
            ) : (
              filteredTeachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  className="flex items-center gap-4 rounded-lg border border-primary/20 p-4"
                  variants={item}
                  whileHover={{ scale: 1.01 }}
                >
                  <Avatar
                    className="h-12 w-12 cursor-pointer hover:opacity-80"
                    onClick={() => handleViewProfile(teacher.id)}
                  >
                    <AvatarImage src={teacher.avatar || "/placeholder.svg?height=48&width=48"} alt={teacher.name} />
                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => handleViewProfile(teacher.id)}
                    >
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{teacher.department}</p>
                    <div className="flex items-center mt-1">
                      <span
                        className={`h-2 w-2 rounded-full mr-2 ${teacher.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                      ></span>
                      <span className="text-xs text-muted-foreground">
                        {teacher.status === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleViewProfile(teacher.id)}
                    >
                      <User className="mr-1 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleStartDM(teacher.id)}
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Message
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
              {selectedTeacher &&
                `Start a direct message with ${mockTeachers.find((t) => t.id === selectedTeacher)?.name}?`}
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
