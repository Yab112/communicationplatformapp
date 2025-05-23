import type { Resource } from "@/types/resource";

// Available departments and their courses
export const departments = [
  {
    name: "Computer Science",
    courses: [
      "Introduction to Programming",
      "Data Structures and Algorithms",
      "Database Systems",
      "Software Engineering",
      "Artificial Intelligence"
    ]
  },
  {
    name: "Engineering",
    courses: [
      "Structural Engineering",
      "Robotics",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Civil Engineering"
    ]
  },
  {
    name: "Mathematics",
    courses: [
      "Calculus I",
      "Calculus II",
      "Linear Algebra",
      "Differential Equations",
      "Statistics"
    ]
  },
  {
    name: "Physics",
    courses: [
      "Classical Mechanics",
      "Quantum Physics",
      "Thermodynamics",
      "Electromagnetism",
      "Optics"
    ]
  },
  {
    name: "Business",
    courses: [
      "Marketing Strategy",
      "Financial Analysis",
      "Business Management",
      "Entrepreneurship",
      "Business Ethics"
    ]
  },
  {
    name: "Arts",
    courses: [
      "Modern Art History",
      "Digital Design",
      "Fine Arts",
      "Art Theory",
      "Visual Communication"
    ]
  }
];

// Available subjects for filtering
export const subjects = departments.map(dept => dept.name);

// Available years for filtering
export const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

// Available file types for filtering
export const fileTypes = ["pdf", "docx", "pptx", "xlsx", "zip"];

export const mockResources: Resource[] = [
  {
    id: "resource-1",
    title: "Introduction to Algorithms - Lecture Notes",
    department: "Computer Science",
    courseId: "Data Structures and Algorithms",
    description: "Comprehensive lecture notes covering fundamental algorithms including sorting, searching, and graph algorithms. Includes complexity analysis and example implementations.",
    fileType: "pdf",
    fileSize: "2.4 MB",
    uploadDate: "2023-04-15T10:30:00Z",
    tags: ["3rd Year", "Lecture", "Algorithms"],
    uploadedBy: {
      id: "teacher-1",
      name: "Dr. Alan Turing",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "lecture"
  },
  {
    id: "resource-2",
    title: "Structural Engineering - Assignment 2",
    department: "Engineering",
    courseId: "Structural Engineering",
    description: "Assignment on structural analysis including beam calculations, stress analysis, and structural design principles. Due date is May 15th.",
    fileType: "docx",
    fileSize: "1.2 MB",
    uploadDate: "2023-04-10T14:45:00Z",
    tags: ["2nd Year", "Assignment", "Structural Engineering"],
    uploadedBy: {
      id: "teacher-2",
      name: "Prof. Marie Curie",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "assignment"
  },
  {
    id: "resource-3",
    title: "Calculus II - Practice Exam",
    department: "Mathematics",
    courseId: "Calculus II",
    description: "Practice exam for Calculus II covering integration techniques, applications of integration, sequences, and series. Solutions included.",
    fileType: "pdf",
    fileSize: "3.1 MB",
    uploadDate: "2023-04-05T09:15:00Z",
    tags: ["1st Year", "Exam", "Calculus"],
    uploadedBy: {
      id: "teacher-3",
      name: "Dr. Isaac Newton",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "exam"
  },
  {
    id: "resource-4",
    title: "Marketing Strategy - Case Studies",
    department: "Business",
    courseId: "Marketing Strategy",
    description: "Collection of case studies on successful marketing strategies from leading companies. Includes analysis questions and discussion points.",
    fileType: "pptx",
    fileSize: "5.7 MB",
    uploadDate: "2023-04-02T16:20:00Z",
    tags: ["3rd Year", "Case Study", "Marketing"],
    uploadedBy: {
      id: "teacher-4",
      name: "Prof. Adam Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "case-study"
  },
  {
    id: "resource-5",
    title: "Quantum Physics - Lab Report Template",
    department: "Physics",
    courseId: "Quantum Physics",
    description: "Template for quantum physics lab reports with guidelines on formatting, data analysis, and error calculation methods.",
    fileType: "docx",
    fileSize: "890 KB",
    uploadDate: "2023-03-28T11:00:00Z",
    tags: ["4th Year", "Lab", "Quantum Physics"],
    uploadedBy: {
      id: "teacher-5",
      name: "Dr. Richard Feynman",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "template"
  },
  {
    id: "resource-6",
    title: "Database Systems - Project Files",
    department: "Computer Science",
    courseId: "Database Systems",
    description: "Project files for the database systems course, including SQL scripts, ER diagrams, and sample data for a university management system.",
    fileType: "zip",
    fileSize: "7.2 MB",
    uploadDate: "2023-03-25T13:30:00Z",
    tags: ["3rd Year", "Project", "Database"],
    uploadedBy: {
      id: "teacher-1",
      name: "Dr. Alan Turing",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "project"
  },
  {
    id: "resource-7",
    title: "Financial Analysis - Excel Templates",
    department: "Business",
    courseId: "Financial Analysis",
    description: "Excel templates for financial analysis including balance sheets, income statements, cash flow statements, and financial ratios calculators.",
    fileType: "xlsx",
    fileSize: "1.8 MB",
    uploadDate: "2023-03-20T09:45:00Z",
    tags: ["2nd Year", "Template", "Finance"],
    uploadedBy: {
      id: "teacher-4",
      name: "Prof. Adam Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "template"
  },
  {
    id: "resource-8",
    title: "Modern Art History - Slide Deck",
    department: "Arts",
    courseId: "Modern Art History",
    description: "Comprehensive slide deck covering the major movements, artists, and works of modern art from the late 19th century to present day.",
    fileType: "pptx",
    fileSize: "12.5 MB",
    uploadDate: "2023-03-15T15:10:00Z",
    tags: ["1st Year", "Lecture", "Art History"],
    uploadedBy: {
      id: "teacher-6",
      name: "Prof. Frida Rivera",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "lecture"
  },
  {
    id: "resource-9",
    title: "Robotics - Final Project Guidelines",
    department: "Engineering",
    courseId: "Robotics",
    description: "Guidelines and requirements for the robotics final project, including evaluation criteria, submission instructions, and example projects.",
    fileType: "pdf",
    fileSize: "1.5 MB",
    uploadDate: "2023-03-10T14:00:00Z",
    tags: ["4th Year", "Project", "Robotics"],
    uploadedBy: {
      id: "teacher-2",
      name: "Prof. Marie Curie",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "project"
  },
  {
    id: "resource-10",
    title: "Data Structures - Code Examples",
    department: "Computer Science",
    courseId: "Data Structures and Algorithms",
    description: "Collection of code examples implementing various data structures including linked lists, trees, graphs, and hash tables in Python and Java.",
    fileType: "zip",
    fileSize: "3.4 MB",
    uploadDate: "2023-03-05T10:30:00Z",
    tags: ["2nd Year", "Code", "Data Structures"],
    uploadedBy: {
      id: "teacher-1",
      name: "Dr. Alan Turing",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "code"
  },
  {
    id: "resource-11",
    title: "Thermodynamics - Problem Set Solutions",
    department: "Physics",
    courseId: "Thermodynamics",
    description: "Detailed solutions to the thermodynamics problem sets covering the first and second laws, entropy, and thermodynamic cycles.",
    fileType: "pdf",
    fileSize: "4.2 MB",
    uploadDate: "2023-03-01T09:00:00Z",
    tags: ["3rd Year", "Solutions", "Thermodynamics"],
    uploadedBy: {
      id: "teacher-5",
      name: "Dr. Richard Feynman",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "solutions"
  },
  {
    id: "resource-12",
    title: "Linear Algebra - Midterm Review",
    department: "Mathematics",
    courseId: "Linear Algebra",
    description: "Comprehensive review materials for the linear algebra midterm, including practice problems, key concepts, and formula sheets.",
    fileType: "pdf",
    fileSize: "2.8 MB",
    uploadDate: "2023-02-25T13:15:00Z",
    tags: ["1st Year", "Exam", "Linear Algebra"],
    uploadedBy: {
      id: "teacher-3",
      name: "Dr. Isaac Newton",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    dueDate: null,
    type: "exam"
  },
];
