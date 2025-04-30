"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet, FilePlus2, Search } from "lucide-react"
import { motion } from "framer-motion"
import { mockResources } from "@/data/mock/resources"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface ResourcesTabsProps {
  roomId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ResourcesTabs({ roomId }: ResourcesTabsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("assignment")

  // Filter resources by type and search query
  const filterResources = (type: string) => {
    return mockResources
      .filter((resource) => {
        // Filter by type
        if (type === "assignment") return resource.type === "assignment"
        if (type === "homeexam") return resource.type === "quiz" // Using quiz data for home exams
        if (type === "resource") return resource.type === "material" // Using material data for resources
        return false
      })
      .filter((resource) => {
        // Filter by search query (title, description, or uploader name)
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.uploadedBy.name.toLowerCase().includes(query) ||
          (resource.tags && resource.tags.some((tag) => tag.toLowerCase().includes(query)))
        )
      })
  }

  const assignments = filterResources("assignment")
  const homeExams = filterResources("homeexam")
  const resources = filterResources("resource")

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

  const renderResourceList = (resources: typeof mockResources) => (
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
                        Due {resource.dueDate ? new Date(resource.dueDate).toLocaleDateString() : "Invalid date"}
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
                  <Button variant="outline" size="sm" className="ml-auto hover:bg-primary/10 hover:text-primary">
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

      {/* Search input */}
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
          {renderResourceList(assignments)}
        </TabsContent>

        <TabsContent value="homeexam" className="mt-4">
          {renderResourceList(homeExams)}
        </TabsContent>

        <TabsContent value="resource" className="mt-4">
          {renderResourceList(resources)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
