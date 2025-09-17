type Props = { textures: string[] }

export default function AnimatedBackground({ textures }: Props) {
  if (!textures?.length) return null
  const layers = textures.slice(0, 4)
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {layers.map((t, i) => (
        <div
          key={i}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: `url('${t}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: i % 2 ? 'multiply' : 'normal',
            opacity: 0.35 + i * 0.12,
            transform: `translateY(${i * 0}px)`
          }}
        />
      ))}
    </div>
  )
}
