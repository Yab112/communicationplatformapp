"use client"

import { motion } from "framer-motion"
import { ExternalLink, Calendar, Briefcase, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockAdvertisements } from "@/data/mock/advertisements"
import type { Advertisement } from "@/types/advertisement"

export function AdvertisementSidebar() {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'opportunity':
        return <Briefcase className="h-4 w-4" />
      case 'promotion':
        return <Gift className="h-4 w-4" />
      default:
        return null
    }
  }

  const renderAd = (ad: Advertisement, index: number) => (
    <motion.div
      key={ad.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative rounded-xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-card)] to-[var(--color-card)]/50 overflow-hidden transition-all hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={ad.image}
          alt={ad.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {ad.priority === 'high' && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-1 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              <span className="text-xs font-medium text-[var(--color-primary)]">Featured</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            ad.type === 'event' ? 'bg-blue-500/10 text-blue-500' :
            ad.type === 'opportunity' ? 'bg-emerald-500/10 text-emerald-500' :
            'bg-purple-500/10 text-purple-500'
          }`}>
            {getTypeIcon(ad.type)}
            {ad.type.charAt(0).toUpperCase() + ad.type.slice(1)}
          </span>
        </div>

        <h3 className="mb-2 text-base font-semibold tracking-tight text-[var(--color-fg)]">
          {ad.title}
        </h3>
        
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted-fg)] line-clamp-2">
          {ad.description}
        </p>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full gap-2 bg-transparent transition-all hover:bg-[var(--color-primary)] hover:text-white"
        >
          <a href={ad.link} target="_blank" rel="noopener noreferrer">
            Learn More
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </motion.div>
  )

  return (
    <div className="h-[calc(100vh-4rem)] sticky top-16 flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="sticky top-0 z-10 h-12 flex items-center justify-between px-4 bg-inherit">
        <h3 className="text-sm font-semibold">Featured</h3>
        <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          {mockAdvertisements.length} Available
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto feeds-scroll-hidden">
        <div className="p-4">
          <div className="grid gap-4 auto-rows-max">
            {mockAdvertisements.map((ad, index) => renderAd(ad, index))}
          </div>
        </div>
      </div>
    </div>
  )
} 