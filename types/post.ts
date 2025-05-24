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
  }
  createdAt: string
  reactions: CommentReaction[]
}

export interface CommentReaction {
  id: string
  type: string
  userId: string
  createdAt: string
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
  image?: string | null
  video?: string | null
  videoPoster?: string | null
  likes: number
  comments: Comment[]
  isLiked: boolean
}
