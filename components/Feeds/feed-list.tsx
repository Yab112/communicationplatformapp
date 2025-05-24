"use client"

import { PostCard } from "@/components/Feeds/post-card"
import type { Post } from "@/types/post"
import { motion } from "framer-motion"
import NoFeedFound from "./no-feed-found"

interface FeedListProps {
  posts: Post[]
}

export function FeedList({ posts }: FeedListProps) {
  if (posts.length === 0) {
    return (
      <NoFeedFound/>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {posts.map((post) => (
        <motion.div
          key={post.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}
    </motion.div>
  )
}
