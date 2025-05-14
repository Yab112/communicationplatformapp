import type { Advertisement } from "@/types/advertisement"

export const mockAdvertisements: Advertisement[] = [
  {
    id: "1",
    title: "Spring Career Fair 2024",
    description: "Connect with top employers and explore internship opportunities. Don't miss this chance to kickstart your career!",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
    link: "/events/career-fair-2024",
    type: "event",
    priority: "high"
  },
  {
    id: "2",
    title: "Research Assistant Position",
    description: "Join our cutting-edge research team in the Computer Science department. Perfect for graduate students!",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60",
    link: "/opportunities/research-assistant",
    type: "opportunity"
  },
  {
    id: "3",
    title: "Summer Coding Bootcamp",
    description: "Learn full-stack development in 12 weeks. Early bird registration now open!",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    link: "/promotions/summer-bootcamp",
    type: "promotion",
    priority: "high"
  },
  {
    id: "4",
    title: "International Student Fair",
    description: "Celebrate diversity and cultural exchange. Food, music, and networking!",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60",
    link: "/events/international-fair",
    type: "event"
  },
  {
    id: "5",
    title: "Graduate Research Symposium",
    description: "Present your research and network with fellow researchers. Cash prizes for top presentations!",
    image: "https://images.unsplash.com/photo-1416339684178-3a239570f315?w=800&auto=format&fit=crop&q=60",
    link: "/events/research-symposium",
    type: "event",
    priority: "high"
  },
  {
    id: "6",
    title: "Teaching Assistant Positions",
    description: "Multiple TA positions available for the upcoming semester in various departments.",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=60",
    link: "/opportunities/ta-positions",
    type: "opportunity"
  },
  {
    id: "7",
    title: "Campus Store Discount",
    description: "50% off on all academic supplies and university merchandise this week only!",
    image: "https://images.unsplash.com/photo-1576072133139-b98bf2b6ac91?w=800&auto=format&fit=crop&q=60",
    link: "/promotions/store-discount",
    type: "promotion"
  }
] 