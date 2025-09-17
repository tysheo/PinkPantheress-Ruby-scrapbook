import { motion } from 'framer-motion'

const TITLE = Array.from('PINK PANTHERESS × RUBY')

export default function HeaderTiles() {
  return (
    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 sm:gap-3">
      {TITLE.map((ch, i) => (
        <motion.div
          key={i}
          initial={{ y: 30, opacity: 0, rotate: (Math.random()*4-2) }}
          animate={{ y: 0, opacity: 1, rotate: (Math.random()*2-1) }}
          transition={{ type: 'spring', stiffness: 140, damping: 12, delay: i * 0.04 }}
          whileHover={{ y: -2, rotate: (Math.random()*2-1) }}
          className="tile aspect-square flex items-center justify-center select-none text-ink text-lg sm:text-2xl md:text-3xl font-[600]"
          aria-hidden
        >
          {ch === ' ' ? '' : ch}
        </motion.div>
      ))}
    </div>
  )
}
