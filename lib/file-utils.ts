import { FileText, FileImage, FileArchive, FileSpreadsheet, File } from "lucide-react"

export function getFileIcon(fileType: string) {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return FileText
    case "docx":
    case "doc":
      return FileText
    case "pptx":
    case "ppt":
      return FileImage
    case "xlsx":
    case "xls":
    case "csv":
      return FileSpreadsheet
    case "zip":
    case "rar":
      return FileArchive
    default:
      return File
  }
}
