"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { CommentSection } from "@/components/Feeds/comment-section"
import type { Post } from "@/types/post"

interface PostDetailModalProps {
    post: Post | null
    isOpen: boolean
    onClose: () => void
}

export function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
    if (!post) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[800px] max-h-[90vh] p-0 gap-0 overflow-auto bg-[var(--color-bg)]">
                <div className="flex flex-col">
                    {/* Author Info */}
                    <div className="p-6 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-lg">{post.author.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {post.author.role}
                                    </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                            <p className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
                        </div>

                        {/* Post Media */}
                        {post.image && (
                            <div className="mb-6 rounded-lg overflow-hidden border border-[var(--color-border)]">
                                <img
                                    src={post.image}
                                    alt="Post image"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {post.video && (
                            <div className="mb-6 rounded-lg overflow-hidden border border-[var(--color-border)]">
                                <video
                                    src={post.video}
                                    controls
                                    className="w-full"
                                    poster={post.videoPoster || undefined}
                                />
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-[var(--color-border)] bg-[var(--color-accent)]/50">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Comments</h2>
                            <CommentSection postId={post.id} comments={post.comments} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 