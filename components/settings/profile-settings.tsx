"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { profileFormSchema } from "@/lib/validator/profile"
import { departments, years } from "@/app/constants"
import { useUser } from "@/context/user-context"
import { updateProfile } from "@/lib/actions/settings"

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileSettings() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, refreshUser } = useUser()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      department: "",
      year: "",
      bio: "",
    },
  })

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        department: user.department || "",
        year: user.year || "",
        bio: user.bio || "",
      })
      setAvatarPreview(user.image || null)
    }
  }, [user, form])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarPreview(null)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const result = await updateProfile({
        ...data,
        image: avatarPreview || undefined,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      await refreshUser()
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 no-scrollbar space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Update your personal information and profile picture.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || "/placeholder.svg?height=96&width=96"} alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="mt-2" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </Button>

                {avatarPreview && (
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={removeAvatar}>
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="min-h-[120px] resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Write a short bio to let others know about your interests and background.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
