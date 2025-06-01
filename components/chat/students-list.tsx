"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ProfileModal, type ProfileType } from "@/components/profile/profile-modal"
import { createOrGetDMRoom } from "@/lib/actions/chat"
import { useUsers } from "@/context/users-context"
import type { User as UserType } from "@/context/user-context"
// import type { ChatRoom } from "@/types/chat"

interface StudentsListProps {
  onSelect: (roomId: string) => void
}

export function StudentsList({ onSelect }: StudentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const { toast } = useToast()
  const { students, loadingStudents } = useUsers()

  const filteredStudents = students.filter((student) => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateChatRoom = async (studentId: string) => {
    try {
      setLoading(true)
      const result = await createOrGetDMRoom(studentId)

      if ("error" in result) {
        toast({
          title: "Error creating chat",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.room) {
        toast({
          title: "Chat created",
          description: `Chat with ${result.room.name} created successfully.`, 
        })
        onSelect(result.room.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenProfileModal = (studentId: string) => {
    setSelectedProfileId(studentId)
    setIsProfileModalOpen(true)
  }

  const handleCloseProfileModal = () => {
    setSelectedProfileId(null)
    setIsProfileModalOpen(false)
  }

  const getProfileType = (student: typeof students[0]): ProfileType => ({
    id: student.id,
    name: student.name,
    email: student.email,
    emailVerified: null,
    image: student.image || null,
    role: student.role,
    department: student.department || null,
    status: student.status || "offline",
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <div className="relative mb-4">
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

      {/* Replace ScrollArea with a div with overflow-y-auto */}
      <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
        {loadingStudents ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No students found</p>
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.image || undefined} alt={student.name} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    {student.department && (
                      <p className="text-sm text-muted-foreground">{student.department}</p>
                    )}
                    {student.year && (
                      <p className="text-sm text-muted-foreground">Year {student.year}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenProfileModal(student.id)}>
                    <User className="h-4 w-4" />
                    <span className="sr-only">View Profile</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCreateChatRoom(student.id)} disabled={loading}>
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Start Chat</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isProfileModalOpen && selectedProfileId && (
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={handleCloseProfileModal} 
          profile={students.find((s) => s.id === selectedProfileId) ? getProfileType(students.find((s) => s.id === selectedProfileId)!) : null}
        />
      )}
    </div>
  )
}
