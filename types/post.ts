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
  author: Author
  createdAt: string
  reactions: Reaction[]
}

export interface Post {
  id: string
  content: string
  department: string
  author: Author
  createdAt: string
  image: string | null
  video?: string | null
  videoPoster?: string | null
  likes: number
  isLiked: boolean
  comments: Comment[]
}
