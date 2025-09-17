import { motion, useScroll, useTransform } from 'framer-motion'
import { useMemo } from 'react'
import { seeded } from '../lib/random'

type Props = {
  stickers: string[]
  photos: { src: string; caption?: string }[]
}

export default function FloatingCollage({ stickers, photos }: Props) {
  const { scrollYProgress } = useScroll()
  const drift = useTransform(scrollYProgress, [0, 1], [0, 200])
  const seed = seeded('ruby-collage')

  const items = useMemo(() => {
    const s = stickers.slice(0, 12).map((src, idx) => ({ src, type: 'sticker' as const, key: `s${idx}` }))
    const p = photos.slice(0, 8).map((m, idx) => ({ src: m.src, type: 'photo' as const, key: `p${idx}` }))
    const all = [...s, ...p]
    return all.map((it, i) => {
      const x = 5 + seed()*90
      const y = 5 + seed()*80
      const r = -8 + seed()*16
      const z = i
      const scale = it.type === 'photo' ? 0.9 + seed()*0.3 : 0.6 + seed()*0.4
      return { ...it, x, y, r, z, scale }
    })
  }, [stickers, photos])

  return (
    <div className="relative h-[120vh] -mt-10 mb-10">
      {items.map((it, i) => (
        <motion.img
          key={it.key}
          src={it.src}
          className={it.type==='photo' ? 'polaroid p-1 absolute' : 'absolute'}
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            width: it.type==='photo' ? 200 : 120,
            height: 'auto',
            rotate: `${it.r}deg`,
            scale: it.scale,
            y: useTransform(drift, (d)=>d * (0.1 + (i%5)*0.05))
          }}
          alt={it.type}
          loading="lazy"
        />
      ))}
    </div>
  )
}
