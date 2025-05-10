"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet, FilePlus2, Search } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getResources } from "@/lib/actions/resources"
import type { Resource } from "@/types/resource"

interface ResourcesTabsProps {
  roomId: string
  initialResources?: Resource[]
}

export function ResourcesTabs({ roomId, initialResources = [] }: ResourcesTabsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("assignment")
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const fetchResources = async () => {
      try {
        const { resources: fetchedResources, error } = await getResources({
          type: activeTab === "assignment" ? "assignment" : activeTab === "homeexam" ? "quiz" : "material",
          search: searchQuery,
        })

        if (!isMounted) return

        if (error) {
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
          return
        }

        if (fetchedResources) {
          const transformedResources: Resource[] = fetchedResources.map(resource => ({
            id: resource.id,
            title: resource.title,
            description: resource.description,
            type: resource.type,
            url: resource.url || "",
            fileSize: resource.fileSize?.toString() || "",
            department: resource.department || "",
            courseId: resource.courseId || "",
            fileType: resource.fileType || "",
            uploadDate: resource.createdAt.toISOString(),
            tags: resource.tags || [],
            uploadedBy: {
              id: resource.author.id,
              name: resource.author.name,
              avatar: resource.author.image || "",
            },
            dueDate: null,
          }))

          setResources(transformedResources)
        }
      } catch (error) {
        if (!isMounted) return
        toast({
          title: "Error",
          description: "Failed to fetch resources",
          variant: "destructive",
        })
      }
    }

    fetchResources()

    return () => {
      isMounted = false
    }
  }, [activeTab, searchQuery, toast])

  const handleDownload = async (resource: Resource) => {
    if (!resource.url) {
      toast({
        title: "Error",
        description: "No file URL available for download",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(resource.url)
      if (!response.ok) throw new Error("Failed to download file")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = resource.title
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "File downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      })
    }
  }

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

  const renderResourceList = (resources: Resource[]) => (
    <ScrollArea className="h-[50vh]">
      <motion.div className="space-y-4 pr-4" variants={container} initial="hidden" animate="show">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FilePlus2 className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No resources found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Resources will appear here when they are posted"}
            </p>
          </div>
        ) : (
          resources.map((resource) => (
            <motion.div key={resource.id} variants={item} whileHover={{ scale: 1.01 }}>
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </div>
                    {resource.type === "assignment" && resource.dueDate && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        Due {new Date(resource.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      {resource.fileType === "pdf" ? (
                        <FileText className="h-4 w-4 text-primary" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span>
                      {resource.fileType.toUpperCase()} • {resource.fileSize}
                    </span>
                  </div>

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">Uploaded by: {resource.uploadedBy.name}</div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </ScrollArea>
  )

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">Section Resources</h2>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search by topic, title, or uploader..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="assignment" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          <TabsTrigger value="homeexam">Home Exam</TabsTrigger>
          <TabsTrigger value="resource">Resource</TabsTrigger>
        </TabsList>

        <TabsContent value="assignment" className="mt-4">
          {renderResourceList(resources)}
        </TabsContent>

        <TabsContent value="homeexam" className="mt-4">
          {renderResourceList(resources)}
        </TabsContent>

        <TabsContent value="resource" className="mt-4">
          {renderResourceList(resources)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
