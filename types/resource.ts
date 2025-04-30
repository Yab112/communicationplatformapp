export interface ResourceUploader {
    id: string
    name: string
    avatar: string
  }
  
  export interface Resource {
    dueDate: Date | null
    type: string
    id: string
    title: string
    subject: string
    description: string
    fileType: string
    fileSize: string
    uploadDate: string
    tags: string[]
    uploadedBy: ResourceUploader
    // fileUrl: string
  }
  