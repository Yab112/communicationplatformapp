export interface Author {
  id: string
  name: string
  avatar: string
  role: "Student" | "Teacher" | "Admin"
  verified?: boolean
}

export interface Reaction {
  id: string
  type: string
  author: Author
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
    role: string
  }
  createdAt: string
  reactions: CommentReaction[]
}

export interface CommentReaction {
  id: string
  type: string
  author: {
    id: string
    name: string
    avatar: string
    role: string
  }
  createdAt: string
}

export interface PostMedia {
  id: string
  type: "image" | "video"
  url: string
  poster?: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  content: string
  department: string
  author: {
    id: string
    name: string
    avatar: string
    role: string
  }
  createdAt: string
  media: Array<{
    id: string
    type: 'image' | 'video'
    url: string
    poster?: string
    order: number
    createdAt: string
    updatedAt: string
  }>
  likes: number
  comments: Comment[]
  isLiked: boolean
}
