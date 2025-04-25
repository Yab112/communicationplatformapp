import type { Post } from "@/types/post"

export const mockPosts: Post[] = [
  {
    id: "post-1",
    content:
      "Just published a new research paper on quantum computing applications in cryptography. Check it out in the university repository!",
    department: "Computer Science",
    author: {
      id: "user-1",
      name: "Dr. Alan Turing",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Teacher",
    },
    createdAt: "2023-04-22T10:30:00Z",
    image: "/placeholder.svg?height=400&width=600",
    likes: 42,
    comments: [
      {
        id: "comment-1",
        content: "This is groundbreaking work! Looking forward to discussing this in class.",
        author: {
          id: "user-3",
          name: "Jane Smith",
          avatar: "/placeholder.svg?height=32&width=32",
          role: "Student",
        },
        createdAt: "2023-04-22T11:15:00Z",
      },
      {
        id: "comment-2",
        content: "I've been waiting for this! Can we schedule a meeting to discuss potential applications?",
        author: {
          id: "user-4",
          name: "Robert Johnson",
          avatar: "/placeholder.svg?height=32&width=32",
          role: "Student",
        },
        createdAt: "2023-04-22T12:45:00Z",
      },
    ],
  },
  {
    id: "post-2",
    content:
      "Reminder: The deadline for the midterm project submissions is this Friday at 11:59 PM. Make sure to upload your work to the course portal.",
    department: "Engineering",
    author: {
      id: "user-2",
      name: "Prof. Marie Curie",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Teacher",
    },
    createdAt: "2023-04-21T15:45:00Z",
    image: null,
    likes: 28,
    comments: [
      {
        id: "comment-3",
        content: "Will there be any extension for the deadline?",
        author: {
          id: "user-5",
          name: "Emily Chen",
          avatar: "/placeholder.svg?height=32&width=32",
          role: "Student",
        },
        createdAt: "2023-04-21T16:30:00Z",
      },
    ],
  },
  {
    id: "post-3",
    content:
      "Just finished my final project for the Advanced AI course! It's a neural network that can generate music based on emotional inputs. Check out this sample!",
    department: "Computer Science",
    author: {
      id: "user-3",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Student",
    },
    createdAt: "2023-04-20T09:15:00Z",
    image: "/placeholder.svg?height=400&width=600",
    likes: 56,
    comments: [
      {
        id: "comment-4",
        content: "This is incredible work, Jane! I'd love to see how you implemented the emotional mapping.",
        author: {
          id: "user-1",
          name: "Dr. Alan Turing",
          avatar: "/placeholder.svg?height=32&width=32",
          role: "Teacher",
        },
        createdAt: "2023-04-20T10:00:00Z",
      },
      {
        id: "comment-5",
        content: "Amazing! Can you share the GitHub repo?",
        author: {
          id: "user-4",
          name: "Robert Johnson",
          avatar: "/placeholder.svg?height=32&width=32",
          role: "Student",
        },
        createdAt: "2023-04-20T11:30:00Z",
      },
    ],
  },
  {
    id: "post-4",
    content:
      "The Business School is hosting a networking event next Tuesday with alumni from top companies. Great opportunity to make connections for internships and jobs!",
    department: "Business",
    author: {
      id: "user-6",
      name: "Prof. Adam Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Teacher",
    },
    createdAt: "2023-04-19T14:00:00Z",
    image: "/placeholder.svg?height=400&width=600",
    likes: 35,
    comments: [],
  },
  {
    id: "post-5",
    content:
      "Our art exhibition 'Perspectives' opens tomorrow at the university gallery. Come see the amazing work from students across all departments!",
    department: "Arts",
    author: {
      id: "user-7",
      name: "Prof. Frida Rivera",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Teacher",
    },
    createdAt: "2023-04-18T16:20:00Z",
    image: "/placeholder.svg?height=400&width=600",
    likes: 48,
    comments: [
      {
        id: "comment-6",
        content: "Looking forward to it! Will there be refreshments?",
        author: {
          id: "user-8",
          name: "Michael Brown",
          avatar: "/placeholder.svg?height=32&width=32",
          role: "Student",
        },
        createdAt: "2023-04-18T17:00:00Z",
      },
    ],
  },
]
