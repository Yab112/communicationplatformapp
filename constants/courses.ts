import { departments } from './departments'

export const departmentCourses: { [key: string]: string[] } = {
  "Biology": [
    "General Biology",
    "Cell Biology",
    "Genetics",
    "Ecology",
    "Evolutionary Biology",
    "Microbiology",
    "Biochemistry",
    "Molecular Biology"
  ],
  "Biomechanics and Rehabilitation": [
    "Biomechanics",
    "Physical Therapy",
    "Rehabilitation Engineering",
    "Human Movement Analysis",
    "Sports Biomechanics",
    "Clinical Biomechanics"
  ],
  "Biomedical Engineering": [
    "Medical Device Design",
    "Biomaterials",
    "Medical Imaging",
    "Biomechanics",
    "Bioinstrumentation",
    "Tissue Engineering"
  ],
  "Business Administration Information System": [
    "Database Management",
    "Business Analytics",
    "Enterprise Systems",
    "IT Project Management",
    "Business Intelligence",
    "E-Commerce"
  ],
  "Business Information System": [
    "Information Systems",
    "Data Management",
    "Business Process Analysis",
    "Systems Analysis and Design",
    "IT Strategy",
    "Digital Business"
  ],
  "Business Leadership": [
    "Strategic Management",
    "Organizational Behavior",
    "Leadership Development",
    "Change Management",
    "Business Ethics",
    "Corporate Governance"
  ],
  "Chemical Engineering": [
    "Process Design",
    "Chemical Reaction Engineering",
    "Transport Phenomena",
    "Plant Design",
    "Process Control",
    "Chemical Thermodynamics"
  ],
  "Chemistry": [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Analytical Chemistry",
    "Biochemistry",
    "Chemical Kinetics"
  ],
  "Chemistry Education": [
    "Chemistry Teaching Methods",
    "Laboratory Safety",
    "Chemistry Curriculum Design",
    "Science Education",
    "Chemistry Assessment",
    "Chemistry Pedagogy"
  ],
  "Chinese Language": [
    "Chinese Grammar",
    "Chinese Literature",
    "Chinese Translation",
    "Chinese Culture",
    "Business Chinese",
    "Chinese Linguistics"
  ],
  "Civil and Environmental Engineering": [
    "Structural Analysis",
    "Environmental Engineering",
    "Water Resources",
    "Transportation Engineering",
    "Geotechnical Engineering",
    "Construction Management"
  ],
  "Civil Engineering": [
    "Structural Engineering",
    "Geotechnical Engineering",
    "Transportation Engineering",
    "Construction Management",
    "Hydraulic Engineering",
    "Surveying"
  ],
  "Computer Science": [
    "Data Structures",
    "Algorithms",
    "Software Engineering",
    "Database Systems",
    "Operating Systems",
    "Computer Networks"
  ],
  "Economics": [
    "Microeconomics",
    "Macroeconomics",
    "Econometrics",
    "International Economics",
    "Development Economics",
    "Public Economics"
  ],
  "Electrical Engineering": [
    "Circuit Analysis",
    "Digital Electronics",
    "Power Systems",
    "Control Systems",
    "Electromagnetic Theory",
    "Signal Processing"
  ],
  "Mechanical Engineering": [
    "Thermodynamics",
    "Fluid Mechanics",
    "Machine Design",
    "Manufacturing Processes",
    "Heat Transfer",
    "Robotics"
  ],
  "Physics": [
    "Classical Mechanics",
    "Quantum Mechanics",
    "Electromagnetism",
    "Thermodynamics",
    "Optics",
    "Nuclear Physics"
  ],
  "Psychology": [
    "Cognitive Psychology",
    "Social Psychology",
    "Developmental Psychology",
    "Clinical Psychology",
    "Research Methods",
    "Behavioral Psychology"
  ]
}

// Helper function to get courses for a department
export const getCoursesForDepartment = (departmentName: string): string[] => {
  return departmentCourses[departmentName] || []
}

// Get all unique courses across all departments
export const getAllCourses = (): string[] => {
  const allCourses = new Set<string>()
  Object.values(departmentCourses).forEach(courses => {
    courses.forEach(course => allCourses.add(course))
  })
  return Array.from(allCourses)
} 