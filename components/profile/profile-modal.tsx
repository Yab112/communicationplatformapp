"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { useRouter } from "next/navigation"

// Define the profile schema with Zod
export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.enum(["Student", "Teacher", "Admin"]),
  department: z.string(),
  year: z.string().optional(), // Only for students
  bio: z.string().optional(),
  status: z.enum(["online", "offline"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  joinDate: z.string().optional(),
  specialization: z.string().optional(),
})

export type ProfileType = z.infer<typeof profileSchema>

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: ProfileType | null
  onStartDM?: (profileId: string) => void
}

export function ProfileModal({ isOpen, onClose, profile, onStartDM }: ProfileModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Let's ensure the profile modal doesn't cause infinite updates

  // Update the handleStartDM function to prevent potential loops:
  const handleStartDM = () => {
    if (!profile || isLoading) return // Prevent multiple clicks

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      if (onStartDM) {
        onStartDM(profile.id)
      } else {
        toast({
          title: "Direct message created",
          description: `You can now chat with ${profile.name}`,
        })
      }
      onClose()
    }, 500)
  }

  const handleViewFullProfile = () => {
    // In a real app, navigate to the full profile page
    toast({
      title: "View full profile",
      description: "Navigating to full profile page",
    })
    onClose()
  }

  const handleEditProfile = () => {
    router.push("/settings")
    onClose()
  }

  if (!profile) return null

  const getRoleBadgeColor = () => {
    switch (profile.role) {
      case "Teacher":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Student":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const isCurrentUser = profile.id === "current-user"

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar || "/placeholder.svg?height=96&width=96"} alt={profile.name} />
                  <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>

                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRoleBadgeColor()}>{profile.role}</Badge>
                  {profile.status && (
                    <span className="flex items-center text-xs text-muted-foreground">
                      <span
                        className={`h-2 w-2 rounded-full mr-1 ${profile.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                      ></span>
                      {profile.status === "online" ? "Online" : "Offline"}
                    </span>
                  )}
                </div>

                <div className="w-full space-y-3 mb-4">
                  {profile.department && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.department}</span>
                    </div>
                  )}

                  {profile.year && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.year}</span>
                    </div>
                  )}

                  {profile.email && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}

                  {profile.phone && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  )}

                  {profile.location && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  {profile.joinDate && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {profile.joinDate}</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <div className="mb-6 text-sm">
                    <p className="text-center">{profile.bio}</p>
                  </div>
                )}

                <div className="flex gap-3 w-full">
                  {isCurrentUser ? (
                    <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleEditProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1" onClick={handleViewFullProfile}>
                        <User className="mr-2 h-4 w-4" />
                        View Full Profile
                      </Button>

                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={handleStartDM}
                        disabled={isLoading}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
