"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/actions/users"
import { useUser } from "@/context/user-context"
import { Skeleton } from "@/components/ui/skeleton"

// Define the profile schema with Zod
export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  role: z.string(),
  department: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
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
  const [fullProfile, setFullProfile] = useState<ProfileType | null>(null)
  const router = useRouter()
  const { user: currentUser, loading: userLoading } = useUser()

  console.log("Current User from Context:", currentUser)
  console.log("Profile Prop:", profile)

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!profile) return

      try {
        // If it's the current user, use the user context data
        if (profile.id === "current-user" && currentUser) {
          console.log("Setting profile from current user:", currentUser)
          setFullProfile({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            emailVerified: null,
            image: currentUser.image || null,
            role: currentUser.role,
            department: currentUser.department || null,
            status: currentUser.status || "offline",
            createdAt: new Date(),
            updatedAt: new Date()
          })
          return
        }

        // For other users, fetch their profile
        console.log("Fetching profile for user:", profile.id)
        const response = await fetch(`/api/users/${profile.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user profile")
        }
        const userData = await response.json()
        console.log("API Response:", userData)

        if (userData.error) {
          throw new Error(userData.error)
        }

        setFullProfile({
          ...userData,
          emailVerified: userData.emailVerified ? new Date(userData.emailVerified) : null,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt)
        })
      } catch (error) {
        console.error("Profile fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to fetch complete profile data",
          variant: "destructive",
        })
      }
    }

    if (isOpen) {
      fetchFullProfile()
    }
  }, [isOpen, profile, toast, currentUser])

  console.log("Full Profile State:", fullProfile)

  const handleStartDM = () => {
    if (!fullProfile || isLoading) return
    setIsLoading(true)
    if (onStartDM) {
      onStartDM(fullProfile.id)
    }
    setIsLoading(false)
    onClose()
  }

  const handleViewFullProfile = () => {
    router.push(`/profile/${fullProfile?.id}`)
    onClose()
  }

  const handleEditProfile = () => {
    router.push("/settings")
    onClose()
  }

  if (userLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] p-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-3 w-full">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!fullProfile) return null

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "teacher":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const isCurrentUser = fullProfile.id === currentUser?.id

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={fullProfile.image || "/placeholder.svg?height=96&width=96"} alt={fullProfile.name} />
                  <AvatarFallback className="text-2xl">{fullProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold mb-1">{fullProfile.name}</h2>

                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getRoleBadgeColor(fullProfile.role)}>{fullProfile.role}</Badge>
                  <span className="flex items-center text-xs text-muted-foreground">
                    <span
                      className={`h-2 w-2 rounded-full mr-1 ${fullProfile.status.toLowerCase() === "online" ? "bg-green-500" : "bg-gray-400"}`}
                    ></span>
                    {fullProfile.status.toLowerCase() === "online" ? "Online" : "Offline"}
                  </span>
                </div>

                <div className="w-full space-y-3 mb-4">
                  {fullProfile.department && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{fullProfile.department}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{fullProfile.email}</span>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(fullProfile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  {isCurrentUser ? (
                    <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleEditProfile}>
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button className="flex-1" variant="outline" onClick={handleViewFullProfile}>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                      {onStartDM && (
                        <Button className="flex-1" onClick={handleStartDM} disabled={isLoading}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      )}
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
