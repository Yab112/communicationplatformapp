"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ProfileModal, type ProfileType } from "@/components/profile/profile-modal"
import { createChatRoom } from "@/lib/actions/chat"
import { getTeachers } from "@/lib/actions/users"
// import type { ChatRoom } from "@/types/chat"

interface TeachersListProps {
  onSelect: (roomId: string) => void
}

export function TeachersList({ onSelect }: TeachersListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<typeof mockTeachers>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast()

  const handlefetchteacher = () =>{
    try  {
      const teachers = getTeachers()
      setTeachers(teachers)
    } catch (error) {
      console.error(error)
    }
  }

  const filteredTeachers = teachers.filter(teacher=> 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateChatRoom = async (teacherId: string) => {
    try {
      setLoading(true)
      // Use a placeholder for the current user's ID for now
      const memberIds = ["current-user-id", teacherId];
      const teacher = teachers.find(t => t.id === teacherId);
      const roomName = teacher?.name || "Direct Message";
      
      const result = await createChatRoom(roomName, memberIds); 

      if ("error" in result) {
        toast({
          title: "Error creating chat",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.chatRoom) {
         toast({
            title: "Chat created",
            description: `Chat with ${teacher?.name || 'teacher'} created successfully.`, 
          });
          // Signal to the parent (ChatSidebar) that a room was created
          // The parent will refetch the room list and handle selecting the new room.
          onSelect(result.chatRoom.id);
      }
    } catch (error) {
       toast({
          title: "Error",
          description: "Failed to create chat room",
          variant: "destructive",
        });
    } finally {
      setLoading(false)
    }
  }

  const handleOpenProfileModal = (teacherId: string) => {
    setSelectedProfileId(teacherId);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setSelectedProfileId(null);
    setIsProfileModalOpen(false);
  };


  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
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
      </div>

      {/* Replace ScrollArea with a div with overflow-y-auto */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading teachers...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No teachers found</p>
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={teacher.image || undefined} alt={teacher.name} />
                    <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    {teacher.department && (
                      <p className="text-sm text-muted-foreground">{teacher.department}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" onClick={() => handleOpenProfileModal(teacher.id)}>
                      <User className="h-4 w-4" />
                      <span className="sr-only">View Profile</span>
                    </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCreateChatRoom(teacher.id)} disabled={loading}>
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
        <ProfileModal isOpen={isProfileModalOpen} onClose={handleCloseProfileModal} profile={{ id: selectedProfileId, name: "", email: "", emailVerified: null, image: null, role: "", status: "", createdAt: new Date(), updatedAt: new Date(), department: null }} />
      )}
    </div>
  )
}
