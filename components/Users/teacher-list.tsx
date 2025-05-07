"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeachers } from "@/lib/actions/users"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Teacher {
  id: string
  name: string
  profileImage: string
  role: "TEACHER"
  department: string
  status: "ONLINE" | "OFFLINE"
}

export function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const data = await getTeachers()
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teachers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={teacher.profileImage} alt={teacher.name} />
                <AvatarFallback>
                  {teacher.name?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{teacher.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{teacher.department}</Badge>
                  <div className="flex items-center">
                    <span
                      className={`h-2 w-2 rounded-full mr-1 ${
                        teacher.status === "ONLINE" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {teacher.status === "ONLINE" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 