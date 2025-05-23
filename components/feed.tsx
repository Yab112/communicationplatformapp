import { useEffect, useState } from 'react'
import { Post } from '@/types/post'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser } from '@/lib/get-session'
import { likePost, addComment } from '@/lib/actions/feed'

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get current user
    getCurrentUser().then(setCurrentUser)
  }, [])

  const handleLike = async (postId: string) => {
    try {
      // Update UI optimistically
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      )

      // Make API call
      const { error } = await likePost(postId)
      if (error) {
        throw new Error(error)
      }
    } catch (error) {
      toast.error('Failed to like post')
      // Revert optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
      )
    }
  }

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      
      // Add comment optimistically
      const newCommentObj = {
        id: Date.now().toString(),
        content: newComment,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.image || "",
          role: currentUser.role,
        },
        createdAt: new Date().toISOString(),
        reactions: [],
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newCommentObj] }
            : post
        )
      )

      // Make API call
      const { error } = await addComment({
        postId,
        content: newComment,
      })

      if (error) {
        throw new Error(error)
      }

      setNewComment('')
      setCommentingPostId(null)
    } catch (error) {
      toast.error('Failed to add comment')
      // Revert optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: post.comments.slice(0, -1) }
            : post
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = async (postId: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${postId}`
      )
      toast.success('Post link copied to clipboard')
    } catch (error) {
      toast.error('Failed to share post')
    }
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.author.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt="Post attachment"
                className="rounded-lg max-h-[400px] object-cover"
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{post.department}</span>
              <span>{post.likes} likes</span>
              <span>{post.comments.length} comments</span>
            </div>
            <div className="flex items-center gap-4 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Like
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommentingPostId(post.id)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(post.id)}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            {commentingPostId === post.id && (
              <div className="w-full space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCommentingPostId(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleComment(post.id)}
                    disabled={isSubmitting}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            )}
            {post.comments.length > 0 && (
              <div className="w-full space-y-2">
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={comment.author.avatar}
                        alt={comment.author.name}
                      />
                      <AvatarFallback>
                        {comment.author.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 