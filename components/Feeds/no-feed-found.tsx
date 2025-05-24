import { motion } from "framer-motion"

export default function NoFeedFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-muted/40 p-10 text-center shadow-sm"
    >
      <div className="text-5xl mb-4">🪹</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-800">
        no posts yet
      </h3>
      <p className="text-gray-500 max-w-md">
        nothing here right now. maybe try adjusting your filters or check back later when someone’s feeling talkative.
      </p>
    </motion.div>
  )
}
