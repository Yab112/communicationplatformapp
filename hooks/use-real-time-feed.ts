"use client"

import { useState, useEffect } from "react"
import type { Post, Comment } from "@/types/post"
import { useSocket } from "@/providers/socket-provider"

type FeedUpdate = {
  type: "new-post" | "new-comment" | "new-like"
  post?: Post
  postId?: string
  comment?: Comment
  userId?: string
}

export function useRealTimeFeed(initialPosts: Post[]) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const { socket, isConnected } = useSocket()

  // Update posts when initialPosts changes
  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  // Listen for feed updates
  useEffect(() => {
    if (socket && isConnected) {
      const handleFeedUpdate = (update: FeedUpdate) => {
        switch (update.type) {
          case "new-post":
            if (update.post) {
              setPosts((prev) => [update.post!, ...prev])
            }
            break
          case "new-comment":
            if (update.postId && update.comment) {
              setPosts((prev) =>
                prev.map((post) => {
                  if (post.id === update.postId) {
                    return {
                      ...post,
                      comments: [...post.comments, update.comment!],
                    }
                  }
                  return post
                }),
              )
            }
            break
          case "new-like":
            if (update.postId) {
              setPosts((prev) =>
                prev.map((post) => {
                  if (post.id === update.postId) {
                    return {
                      ...post,
                      likes: post.likes + 1,
                    }
                  }
                  return post
                }),
              )
            }
            break
        }
      }

      socket.on("feed-update", handleFeedUpdate)

      return () => {
        socket.off("feed-update", handleFeedUpdate)
      }
    }
  }, [socket, isConnected])

  return { posts }
}
