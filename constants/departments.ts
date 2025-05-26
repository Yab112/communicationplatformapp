import { Users } from "lucide-react"

const gradients = [
  "from-[#8B5CF6] via-[#A78BFA] to-[#8B5CF6]", // Purple
  "from-[#3B82F6] via-[#60A5FA] to-[#3B82F6]", // Blue
  "from-[#10B981] via-[#34D399] to-[#10B981]", // Green
  "from-[#F59E0B] via-[#FBBF24] to-[#F59E0B]", // Yellow
  "from-[#EF4444] via-[#F87171] to-[#EF4444]", // Red
  "from-[#EC4899] via-[#F472B6] to-[#EC4899]", // Pink
  "from-[#6366F1] via-[#818CF8] to-[#6366F1]", // Indigo
  "from-[#14B8A6] via-[#2DD4BF] to-[#14B8A6]", // Teal
  "from-[#F97316] via-[#FB923C] to-[#F97316]", // Orange
  "from-[#06B6D4] via-[#22D3EE] to-[#06B6D4]", // Cyan
]

const getGradient = (index: number) => {
  return gradients[index % gradients.length]
}

const getGlow = (gradient: string) => {
  const color = gradient.split('from-[')[1].split(']')[0]
  return `group-hover:shadow-[${color}]/25`
}

export const departments = [
  {
    name: "Biology",
    icon: Users,
    gradient: getGradient(0),
    glow: getGlow(getGradient(0))
  },
  {
    name: "Biomechanics and Rehabilitation",
    icon: Users,
    gradient: getGradient(1),
    glow: getGlow(getGradient(1))
  },
  {
    name: "Biomedical Engineering",
    icon: Users,
    gradient: getGradient(2),
    glow: getGlow(getGradient(2))
  },
  {
    name: "Business Administration Information System",
    icon: Users,
    gradient: getGradient(3),
    glow: getGlow(getGradient(3))
  },
  {
    name: "Business Information System",
    icon: Users,
    gradient: getGradient(4),
    glow: getGlow(getGradient(4))
  },
  {
    name: "Business Leadership",
    icon: Users,
    gradient: getGradient(5),
    glow: getGlow(getGradient(5))
  },
  {
    name: "Chemical Engineering",
    icon: Users,
    gradient: getGradient(6),
    glow: getGlow(getGradient(6))
  },
  {
    name: "Chemistry",
    icon: Users,
    gradient: getGradient(7),
    glow: getGlow(getGradient(7))
  },
  {
    name: "Chemistry Education",
    icon: Users,
    gradient: getGradient(8),
    glow: getGlow(getGradient(8))
  },
  {
    name: "Chinese Language",
    icon: Users,
    gradient: getGradient(9),
    glow: getGlow(getGradient(9))
  },
  {
    name: "Civics and Ethical Education",
    icon: Users,
    gradient: getGradient(0),
    glow: getGlow(getGradient(0))
  },
  {
    name: "Civil and Environmental Engineering",
    icon: Users,
    gradient: getGradient(1),
    glow: getGlow(getGradient(1))
  },
  {
    name: "Civil Engineering",
    icon: Users,
    gradient: getGradient(2),
    glow: getGlow(getGradient(2))
  },
  {
    name: "Civil Engineering (Road and Transport Engineering)",
    icon: Users,
    gradient: getGradient(3),
    glow: getGlow(getGradient(3))
  },
  {
    name: "Civil Engineering (Structural Engineering)",
    icon: Users,
    gradient: getGradient(4),
    glow: getGlow(getGradient(4))
  },
  {
    name: "Accounting & Finance",
    icon: Users,
    gradient: getGradient(5),
    glow: getGlow(getGradient(5))
  },
  {
    name: "Accounting and Finance",
    icon: Users,
    gradient: getGradient(6),
    glow: getGlow(getGradient(6))
  },
  {
    name: "Accounting and Finance with two tracks",
    icon: Users,
    gradient: getGradient(7),
    glow: getGlow(getGradient(7))
  },
  {
    name: "Afan Oromo Language Education",
    icon: Users,
    gradient: getGradient(8),
    glow: getGlow(getGradient(8))
  },
  {
    name: "Amharic Language Education",
    icon: Users,
    gradient: getGradient(9),
    glow: getGlow(getGradient(9))
  },
  {
    name: "Amharic Language, Literature and Folklore",
    icon: Users,
    gradient: getGradient(0),
    glow: getGlow(getGradient(0))
  },
  {
    name: "Anesthesia",
    icon: Users,
    gradient: getGradient(1),
    glow: getGlow(getGradient(1))
  },
  {
    name: "Animal Production",
    icon: Users,
    gradient: getGradient(2),
    glow: getGlow(getGradient(2))
  },
  {
    name: "Applied Mechanics",
    icon: Users,
    gradient: getGradient(3),
    glow: getGlow(getGradient(3))
  },
  {
    name: "Arabic Language and Communication",
    icon: Users,
    gradient: getGradient(4),
    glow: getGlow(getGradient(4))
  },
  {
    name: "Architecture and Design",
    icon: Users,
    gradient: getGradient(5),
    glow: getGlow(getGradient(5))
  },
  {
    name: "Art in Management",
    icon: Users,
    gradient: getGradient(6),
    glow: getGlow(getGradient(6))
  },
  {
    name: "Art in Marketing Management",
    icon: Users,
    gradient: getGradient(7),
    glow: getGlow(getGradient(7))
  },
  {
    name: "Artificial Intelligence",
    icon: Users,
    gradient: getGradient(8),
    glow: getGlow(getGradient(8))
  },
  {
    name: "Arts in Accounting and Finance",
    icon: Users,
    gradient: getGradient(9),
    glow: getGlow(getGradient(9))
  },
  {
    name: "Arts in Economics",
    icon: Users,
    gradient: getGradient(0),
    glow: getGlow(getGradient(0))
  },
  {
    name: "Arts Logistics and Supply Chain Management",
    icon: Users,
    gradient: getGradient(1),
    glow: getGlow(getGradient(1))
  },
  {
    name: "Bachelor of Laws (LLB)",
    icon: Users,
    gradient: getGradient(2),
    glow: getGlow(getGradient(2))
  },
  {
    name: "BEd in Biology",
    icon: Users,
    gradient: getGradient(3),
    glow: getGlow(getGradient(3))
  },
  {
    name: "Civil Infrastructure",
    icon: Users,
    gradient: getGradient(4),
    glow: getGlow(getGradient(4))
  },
  {
    name: "Civil Infrastructure and Engineering",
    icon: Users,
    gradient: getGradient(5),
    glow: getGlow(getGradient(5))
  },
  {
    name: "Communication Engineering",
    icon: Users,
    gradient: getGradient(6),
    glow: getGlow(getGradient(6))
  },
  {
    name: "Computer Engineering",
    icon: Users,
    gradient: getGradient(7),
    glow: getGlow(getGradient(7))
  },
  {
    name: "Computer Science",
    icon: Users,
    gradient: getGradient(8),
    glow: getGlow(getGradient(8))
  },
  {
    name: "Conservation of Urban and Architectural Heritage",
    icon: Users,
    gradient: getGradient(9),
    glow: getGlow(getGradient(9))
  },
  {
    name: "Construction Engineering and Management",
    icon: Users,
    gradient: getGradient(0),
    glow: getGlow(getGradient(0))
  },
  {
    name: "Construction Technology Management",
    icon: Users,
    gradient: getGradient(1),
    glow: getGlow(getGradient(1))
  },
  {
    name: "Control and Automation",
    icon: Users,
    gradient: getGradient(2),
    glow: getGlow(getGradient(2))
  },
  {
    name: "Control Engineering",
    icon: Users,
    gradient: getGradient(3),
    glow: getGlow(getGradient(3))
  },
  {
    name: "Cybersecurity",
    icon: Users,
    gradient: getGradient(4),
    glow: getGlow(getGradient(4))
  },
  {
    name: "Doctor of Dental Medicine",
    icon: Users,
    gradient: getGradient(5),
    glow: getGlow(getGradient(5))
  },
  {
    name: "Doctor of Medicine",
    icon: Users,
    gradient: getGradient(6),
    glow: getGlow(getGradient(6))
  },
  {
    name: "Doctor of Veterinary Medicine",
    icon: Users,
    gradient: getGradient(7),
    glow: getGlow(getGradient(7))
  },
  {
    name: "Economics",
    icon: Users,
    gradient: getGradient(8),
    glow: getGlow(getGradient(8))
  },
  {
    name: "Geomatics Engineering",
    icon: Users,
    gradient: getGradient(9),
    glow: getGlow(getGradient(9))
  },
  {
    name: "Geotechnical Engineering",
    icon: Users,
    gradient: getGradient(0),
    glow: getGlow(getGradient(0))
  },
  {
    name: "History Education",
    icon: Users,
    gradient: getGradient(1),
    glow: getGlow(getGradient(1))
  },
  {
    name: "History, and Archeology and Heritage Management",
    icon: Users,
    gradient: getGradient(2),
    glow: getGlow(getGradient(2))
  },
  {
    name: "Hydraulics Engineering",
    icon: Users,
    gradient: getGradient(3),
    glow: getGlow(getGradient(3))
  },
  {
    name: "Industrial Biotechnology and Biochemical Engineering",
    icon: Users,
    gradient: getGradient(4),
    glow: getGlow(getGradient(4))
  },
  {
    name: "Industrial Engineering",
    icon: Users,
    gradient: getGradient(5),
    glow: getGlow(getGradient(5))
  },
  {
    name: "Industrial Management",
    icon: Users,
    gradient: getGradient(6),
    glow: getGlow(getGradient(6))
  },
  {
    name: "Information Systems",
    icon: Users,
    gradient: getGradient(7),
    glow: getGlow(getGradient(7))
  },
  {
    name: "Infrastructure Planning and Management",
    icon: Users,
    gradient: getGradient(8),
    glow: getGlow(getGradient(8))
  },
  {
    name: "Instrumentation and Imaging",
    icon: Users,
    gradient: getGradient(9),
    glow: getGlow(getGradient(9))
  },
  {
    name: "Integrated Architectural Design",
    icon: Users,
    gradient: getGradient(0),
    glow: getGlow(getGradient(0))
  },
  {
    name: "International Business",
    icon: Users,
    gradient: getGradient(1),
    glow: getGlow(getGradient(1))
  },
  {
    name: "International Business and Strategy",
    icon: Users,
    gradient: getGradient(2),
    glow: getGlow(getGradient(2))
  },
  {
    name: "Irrigation and Drainage Engineering",
    icon: Users,
    gradient: getGradient(3),
    glow: getGlow(getGradient(3))
  },
  {
    name: "Journalism and Communication",
    icon: Users,
    gradient: getGradient(4),
    glow: getGlow(getGradient(4))
  },
  {
    name: "Landscape Architecture",
    icon: Users,
    gradient: getGradient(5),
    glow: getGlow(getGradient(5))
  },
  {
    name: "Logistics and Supply Chain Management",
    icon: Users,
    gradient: getGradient(6),
    glow: getGlow(getGradient(6))
  }
] 