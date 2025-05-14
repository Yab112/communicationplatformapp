"use client"

import { motion } from "framer-motion"
import { ExternalLink, Calendar, Briefcase, Gift, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
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

  const renderAd = (ad: Advertisement) => (
    <motion.div
      key={ad.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-card)] to-[var(--color-card)]/50 p-4 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-primary)]/5"
    >
      {ad.priority === 'high' && (
        <div className="absolute -right-1 -top-1 z-10">
          <div className="relative flex h-6 items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-1">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span className="text-xs font-medium text-[var(--color-primary)]">Featured</span>
          </div>
        </div>
      )}
      
      <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-lg">
        <img
          src={ad.image}
          alt={ad.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="mb-2 flex items-center gap-2">
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
      
      <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted-fg)]">
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
    </motion.div>
  )

  return (
    <div className="hidden w-80 xl:w-96 border-l border-[var(--color-border)] bg-[var(--color-background)] lg:block">
      <div className="sticky top-0 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Featured</h3>
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
            {mockAdvertisements.length} Available
          </span>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            {mockAdvertisements.map(renderAd)}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 