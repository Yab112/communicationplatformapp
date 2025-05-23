"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getStudents } from "@/lib/actions/users"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Student {
  id: string
  name: string
  profileImage: string
  role: "STUDENT"
  department: string
  status: "ONLINE" | "OFFLINE"
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await getStudents()
      setStudents(data)
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
        <CardTitle>Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={student.profileImage} alt={student.name} />
                <AvatarFallback>
                  {student.name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{student.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{student.department}</Badge>
                  <div className="flex items-center">
                    <span
                      className={`h-2 w-2 rounded-full mr-1 ${
                        student.status === "ONLINE" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {student.status === "ONLINE" ? "Online" : "Offline"}
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