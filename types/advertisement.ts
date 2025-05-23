export interface Advertisement {
  id: string
  title: string
  description: string
  image: string
  link: string
  type: 'event' | 'opportunity' | 'promotion'
  priority?: 'high' | 'normal'
} 