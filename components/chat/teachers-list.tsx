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
import { getTeachers } from "@/lib/actions/users"
import { createDirectMessage } from "@/lib/actions/chat"
import { User } from "@/types/user"
import TeacherModalSkeleton from "../skeletons/teachermodal"
import { ProfileModal, type ProfileType } from "@/components/profile/profile-modal"

interface TeachersListProps {
  roomId: string
  onOpenProfile?: (userId: string) => void
  onRoomCreated?: (roomId: string) => void
}

export function TeachersList({ roomId, onOpenProfile, onRoomCreated }: TeachersListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const data = await getTeachers()
      if ('error' in data) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
        return
      }
      setTeachers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTeachers = teachers.filter(
    (teacher) =>
      (teacher.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.department?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
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

  const handleStartDM = (teacherId: string) => {
    setSelectedTeacher(teacherId)
    setShowConfirmDialog(true)
  }

  const handleViewProfile = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    if (teacher) {
      setSelectedProfile({
        id: teacher.id,
        name: teacher.name || "",
        email: teacher.email || "",
        emailVerified: null,
        image: teacher.image || null,
        role: teacher.role,
        department: teacher.department || null,
        status: teacher.status || "offline",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setIsProfileModalOpen(true)
    }
  }

  const confirmStartDM = async () => {
    if (!selectedTeacher) return

    try {
      const result = await createDirectMessage(selectedTeacher)

      if ('error' in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      const teacher = teachers.find((t) => t.id === selectedTeacher)
      toast({
        title: "Direct message created",
        description: `You can now chat with ${teacher?.name}`,
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
      <TeacherModalSkeleton />
    )
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">Teachers</h2>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search teachers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[50vh]">
        <motion.div className="space-y-3 pr-4" variants={container} initial="hidden" animate="show">
          {filteredTeachers.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No teachers found</div>
          ) : (
            filteredTeachers.map((teacher) => (
              <motion.div
                key={teacher.id}
                className="flex items-center gap-3 rounded-lg border border-primary/20 p-3"
                variants={item}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    className="h-10 w-10 cursor-pointer hover:opacity-80"
                    onClick={() => handleViewProfile(teacher.id)}
                  >
                    <AvatarImage src={teacher.image || "/placeholder.svg?height=40&width=40"} alt={teacher.name || "User"} />
                    <AvatarFallback>{(teacher.name || "U").charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => handleViewProfile(teacher.id)}
                    >
                      {teacher.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{teacher.department}</p>
                    <div className="flex items-center mt-1">
                      <span
                        className={`h-2 w-2 rounded-full mr-1 ${teacher.status === "ONLINE" ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {teacher.status === "ONLINE" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleViewProfile(teacher.id)}
                    >
                      <UserIcon className="h-4 w-4" />
                      <span className="sr-only">View profile</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleStartDM(teacher.id)}
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
              {selectedTeacher &&
                `Start a direct message with ${teachers.find((t) => t.id === selectedTeacher)?.name}?`}
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

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
        onStartDM={handleStartDM}
      />
    </div>
  )
}
