export interface ResourceUploader {
    id: string
    name: string
    avatar: string
  }
  
  export interface Resource {
    id: string
    title: string
    description: string
    type: string
    url?: string
    fileSize?: string
    department: string
    courseId: string
    fileType: string
    uploadDate: string
    tags: string[]
    uploadedBy: {
      id: string
      name: string
      avatar: string
    }
    dueDate: string | null
    folderId?: string | null
  }
