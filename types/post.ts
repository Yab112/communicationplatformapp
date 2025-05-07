export interface Author {
  id: string
  name: string
  avatar: string
  role: "Student" | "Teacher" | "Admin"
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
  likes: number
  comments: Comment[]
}
