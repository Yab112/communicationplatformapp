import { useState } from 'react'
import { createPost } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function CreatePost() {
  const [content, setContent] = useState('')
  const [department, setDepartment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !department.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await createPost({
        content,
        department,
      })
      setContent('')
      setDepartment('')
      toast.success('Post created successfully')
    } catch (error) {
      toast.error('Failed to create post')
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div>
        <label htmlFor="department" className="block text-sm font-medium mb-1">
          Department
        </label>
        <Input
          id="department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Enter department"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">
          Content
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          required
          className="min-h-[100px]"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Post'}
      </Button>
    </form>
  )
} 