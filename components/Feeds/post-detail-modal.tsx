"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, Loader2 } from "lucide-react"
import { CommentSection } from "@/components/Feeds/comment-section"
import type { Post } from "@/types/post"
import { cn } from "@/lib/utils"

interface PostDetailModalProps {
    post: Post | null
    isOpen: boolean
    onClose: () => void
}

export function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
    if (!post) return null

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
    const [zoomLevel, setZoomLevel] = useState(1)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [isVideoLoading, setIsVideoLoading] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) {
            setCurrentMediaIndex(0)
            setZoomLevel(1)
            setIsFullScreen(false)
        }
    }, [isOpen])

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
            setIsFullScreen(true)
        } else {
            document.exitFullscreen()
            setIsFullScreen(false)
        }
    }

    const handlePrevious = () => {
        setCurrentMediaIndex(prev => (prev > 0 ? prev - 1 : post.media.length - 1))
        setZoomLevel(1)
    }

    const handleNext = () => {
        setCurrentMediaIndex(prev => (prev < post.media.length - 1 ? prev + 1 : 0))
        setZoomLevel(1)
    }

    const handleVideoLoadStart = () => {
        setIsVideoLoading(true)
    }

    const handleVideoCanPlay = () => {
        setIsVideoLoading(false)
    }

    const handleVideoError = () => {
        setIsVideoLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!w-[90vw] !max-w-[1200px] !h-[85vh] !p-0 flex flex-col animate-in fade-in-50 duration-300 overflow-hidden rounded-xl border-0 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[var(--color-card)] border-b p-4 flex items-center justify-between backdrop-blur-sm bg-opacity-95">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{post.author.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {post.author.role}
                                </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="hover:bg-[var(--color-accent)] rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                    {/* Main Content */}
                    <div className="flex-[3_3_0%] min-w-0 h-full flex flex-col bg-gradient-to-b from-[var(--color-card)] to-[var(--color-accent)] relative">
                        {/* Media Controls */}
                        {post.media && post.media.length > 0 && (
                            <div className="sticky top-0 z-10 bg-[var(--color-card)]/80 backdrop-blur-sm border-b p-2 flex items-center gap-2 justify-center md:justify-end">
                                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleZoomOut}
                                        disabled={zoomLevel <= 0.5}
                                        className="h-8 w-8 rounded-full"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-medium px-1 text-[var(--color-fg)]">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleZoomIn}
                                        disabled={zoomLevel >= 3}
                                        className="h-8 w-8 rounded-full"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleFullScreen}
                                    className="rounded-full h-8 w-8"
                                >
                                    {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        )}

                        {/* Media Display */}
                        <div className="flex-1 flex items-center justify-center overflow-hidden p-4 bg-[var(--color-accent)] bg-opacity-70 backdrop-blur-sm relative">
                            <div ref={containerRef} className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300 shadow-lg bg-[var(--color-card)]">
                                {post.media && post.media.length > 0 ? (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {/* Navigation Buttons */}
                                        {post.media.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handlePrevious}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[var(--color-card)]/80 backdrop-blur-sm hover:bg-[var(--color-card)]"
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleNext}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[var(--color-card)]/80 backdrop-blur-sm hover:bg-[var(--color-card)]"
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </Button>
                                            </>
                                        )}

                                        {/* Current Media */}
                                        {post.media[currentMediaIndex].type === 'image' ? (
                                            <div className="w-full h-full flex items-center justify-center p-4">
                                                <img
                                                    src={post.media[currentMediaIndex].url}
                                                    alt={`Post image ${currentMediaIndex + 1}`}
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{
                                                        transform: `scale(${zoomLevel})`,
                                                        transition: "transform 0.2s ease-in-out",
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-4">
                                                <div className="relative w-full h-full">
                                                    {isVideoLoading && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                                        </div>
                                                    )}
                                                    <video
                                                        ref={videoRef}
                                                        src={post.media[currentMediaIndex].url}
                                                        controls
                                                        className="max-w-full max-h-full"
                                                        poster={post.media[currentMediaIndex].poster || undefined}
                                                        onLoadStart={handleVideoLoadStart}
                                                        onCanPlay={handleVideoCanPlay}
                                                        onError={handleVideoError}
                                                        playsInline
                                                    >
                                                        <source src={post.media[currentMediaIndex].url} type="video/mp4" />
                                                        <source src={post.media[currentMediaIndex].url} type="video/webm" />
                                                        <source src={post.media[currentMediaIndex].url} type="video/ogg" />
                                                        <source src={post.media[currentMediaIndex].url} type="video/quicktime" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </div>
                                            </div>
                                        )}

                                        {/* Media Counter */}
                                        {post.media.length > 1 && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--color-card)]/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                                                {currentMediaIndex + 1} / {post.media.length}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-[var(--color-muted-fg)]">
                                        No media to display
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full md:w-[350px] h-full overflow-y-auto bg-[var(--color-card)] border-t md:border-t-0 md:border-l flex flex-col">
                        <div className="p-6">
                            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                                <p className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
                            </div>

                            {/* Comments Section */}
                            <CommentSection postId={post.id} comments={post.comments} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 