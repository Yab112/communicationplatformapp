import { Construction } from "lucide-react"

export function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <Construction className="h-16 w-16 text-primary mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-primary mb-2">Page Under Construction</h1>
        <p className="text-muted-foreground">
          We`&apos;`re working hard to bring you an amazing experience. This page will be available soon!
        </p>
      </div>
    </div>
  )
} 