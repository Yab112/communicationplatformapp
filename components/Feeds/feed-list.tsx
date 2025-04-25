"use client"


import type { Post } from "@/types/post"
import { PostCard } from "./post-card"

interface FeedListProps {
  posts: Post[]
}

export function FeedList({ posts }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">No posts found</h3>
        <p className="text-muted-foreground">
          There are no posts matching your filters or no posts have been created yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
