import { useState } from 'react'

type Mem = { src: string; caption?: string }
type Props = { memories: Mem[] }

export default function ScrapbookGrid({ memories }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div>
      <div className="columns-2 sm:columns-3 md:columns-4 gap-4 [column-fill:_balance]"><div className="contents">
        {memories.map((m, i) => (
          <figure key={i} className="mb-4 break-inside-avoid polaroid p-2 hover:shadow-lift transition will-change-transform" onClick={() => setOpen(i)}>
            <img
              loading="lazy"
              src={m.src}
              alt={m.caption ?? 'Memory'}
              className="w-full h-auto rounded-md"
              draggable
              onDragStart={(e)=>{
                e.dataTransfer.setData('text/uri-list', m.src)
                e.dataTransfer.setData('text/plain', m.src)
                e.dataTransfer.effectAllowed = 'copyMove'
              }}
            />
            <figcaption className="mt-1 text-center text-xs text-ink/70">{m.caption ?? caption(m.src)}</figcaption>
          </figure>
        ))}
      </div></div>

      {open !== null && (
        <div role="dialog" aria-modal className="fixed inset-0 bg-black/70 grid place-items-center p-6 z-50" onClick={() => setOpen(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={memories[open].src} alt="Large" className="w-full h-auto rounded-lg shadow-lift" />
            <div className="mt-2 text-center text-sm text-cream">{memories[open].caption ?? caption(memories[open].src)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function caption(p: string) {
  const name = decodeURI(p.split('/').pop() || '')
  return name.replace(/\.[^.]+$/, '').replace(/[\-_]+/g, ' ').trim()
}
