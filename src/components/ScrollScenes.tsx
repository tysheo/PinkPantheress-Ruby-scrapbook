import { motion } from 'framer-motion'

type SceneProps = {
  stickers: string[]
  photos: { src: string; caption?: string }[]
}

export default function ScrollScenes({ stickers, photos }: SceneProps) {
  const stick = stickers.slice(0, 8)
  const ph = photos.slice(0, 6)
  return (
    <section aria-label="Intro Scenes" className="relative min-h-[200vh] space-y-24">
      <div className="h-screen grid place-items-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="text-center">
          <h2 className="text-3xl sm:text-4xl font-[600] text-ink mb-3">A scrapbook for Ruby</h2>
          <p className="text-ink/70">Scroll to watch memories float in.</p>
        </motion.div>
      </div>

      <div className="relative h-screen">
        {stick.map((s, i) => (
          <motion.img
            key={i}
            src={s}
            className="absolute w-28 h-28 object-contain"
            initial={{ opacity: 0, y: 60, rotate: -8 + i*2 }}
            whileInView={{ opacity: 1, y: -20, rotate: -2 + i }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 120, damping: 16 }}
            style={{ left: `${10 + (i*12)%80}%`, top: `${20 + (i*9)%60}%` }}
            alt="Sticker"
          />
        ))}
      </div>

      <div className="relative h-screen">
        {ph.map((m, i) => (
          <motion.figure
            key={i}
            className="polaroid p-2 absolute"
            initial={{ opacity: 0, scale: .9, rotate: -6 + i*3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -2 + i }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 120, damping: 16 }}
            style={{ left: `${12 + (i*15)%70}%`, top: `${10 + (i*12)%70}%` }}
          >
            <img src={m.src} alt={m.caption ?? 'Memory'} className="w-40 h-40 object-cover rounded" />
            <figcaption className="mt-1 text-center text-xs text-ink/70">{m.caption ?? ''}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
