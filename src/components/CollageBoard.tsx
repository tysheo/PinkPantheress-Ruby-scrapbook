import { useEffect, useRef, useState } from 'react'
import { Node, exportPNG, loadLayout, saveLayout } from '../lib/collage'

type Props = { stickers: string[]; paper?: string; textures?: string[] }

export default function CollageBoard({ stickers, paper, textures = [] }: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const [nodes, setNodes] = useState<Node[]>(() => {
    const initial = Array.from({ length: Math.min(12, stickers.length) }, (_, i) => ({
      id: `n${i}`,
      src: stickers[(Math.random()*stickers.length)|0],
      x: 300 + Math.random()*300,
      y: 180 + Math.random()*220,
      r: Math.random()*10-5,
      s: 0.5 + Math.random()*0.6,
      z: i
    }))
    return loadLayout(initial)
  })
  const [sel, setSel] = useState<Set<string>>(new Set())

  useEffect(() => { saveLayout(nodes) }, [nodes])

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    const startX = e.clientX, startY = e.clientY
    const before = nodes.find(n => n.id === id)!
    const others = nodes.filter(n => sel.has(n.id) && n.id !== id)
    const selected = sel.size ? nodes.filter(n => sel.has(n.id)) : [before]
    const start = selected.map(n => ({ id: n.id, x: n.x, y: n.y, r: n.r, s: n.s }))

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      const mod = ev.getModifierState('Shift') ? 'rot' : ev.getModifierState('Alt') ? 'scale' : 'move'
      setNodes(prev => prev.map(n => {
        if (!start.some(s => s.id === n.id)) return n
        const st = start.find(s => s.id === n.id)!
        if (mod === 'move') return { ...n, x: st.x + dx, y: st.y + dy }
        if (mod === 'rot') return { ...n, r: st.r + dx * 0.2 }
        return { ...n, s: Math.max(0.2, st.s + dx * 0.002) }
      }))
    }
    const onUp = (ev: PointerEvent) => {
      el.releasePointerCapture(e.pointerId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...nodes.map(n => n.z)) + 1
    setNodes(prev => prev.map(n => n.id === id ? { ...n, z: maxZ } : n))
  }

  const toggleSel = (id: string, meta: boolean) => {
    setSel(prev => {
      const next = new Set(prev)
      if (meta) { next.has(id) ? next.delete(id) : next.add(id) }
      else { next.clear(); next.add(id) }
      return next
    })
  }

  const shuffle = () => setNodes(prev => prev.map(n => ({ ...n, x: 80+Math.random()*640, y: 80+Math.random()*380, r: Math.random()*12-6 })))
  const add5 = () => setNodes(prev => prev.concat(
    Array.from({ length: 5 }, (_, i) => ({
      id: `n${Date.now()}_${i}`,
      src: stickers[(Math.random()*stickers.length)|0],
      x: 120+Math.random()*600,
      y: 120+Math.random()*360,
      r: Math.random()*10-5,
      s: 0.5 + Math.random()*0.6,
      z: Math.max(0, ...prev.map(p=>p.z))+i+1
    }))
  ))

  const [fx, setFx] = useState<'none'|'grayscale'|'contrast'>('none')
  const [torn, setTorn] = useState(false)
  const [halftone, setHalftone] = useState(false)
  const [bg, setBg] = useState<string | undefined>(paper)

  useEffect(() => { setBg(paper) }, [paper])

  const savePng = async () => {
    const el = boardRef.current!
    const data = await exportPNG(nodes, { w: el.clientWidth, h: el.clientHeight }, paper)
    const { dl } = await import('../lib/collage')
    dl(data, 'collage.png')
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 items-center">
        <button className="btn" onClick={shuffle}>Shuffle</button>
        <button className="btn" onClick={add5}>Add 5</button>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-ink/70">Filter</label>
          <select className="rounded-full border border-ink/10 px-3 py-2 bg-white/80" value={fx} onChange={e=>setFx(e.target.value as any)}>
            <option value="none">None</option>
            <option value="grayscale">Grayscale</option>
            <option value="contrast">Contrast+</option>
          </select>
          <button className={`btn ${halftone?'ring-2 ring-hotpink':''}`} onClick={()=>setHalftone(v=>!v)}>Halftone</button>
          <button className={`btn ${torn?'ring-2 ring-hotpink':''}`} onClick={()=>setTorn(v=>!v)}>Torn Edge</button>
        </div>
        {textures.length > 0 && (
          <div className="flex gap-2 items-center">
            <label className="text-sm text-ink/70">Background</label>
            <select className="rounded-full border border-ink/10 px-3 py-2 bg-white/80" value={bg ?? ''} onChange={e=>setBg(e.target.value || undefined)}>
              <option value="">Default</option>
              {textures.map((t, i) => (
                <option key={i} value={t}>{decodeURI(t.split('/').pop() || `Texture ${i+1}`)}</option>
              ))}
            </select>
          </div>
        )}
        <button className="btn" onClick={savePng}>Save PNG</button>
      </div>
      <div
        ref={boardRef}
        className="relative rounded-card border border-ink/10 bg-[var(--paper)] overflow-hidden"
        style={{
          height: 520,
          backgroundImage: `url('${bg ?? "/textures/paper.jpg"}')`,
          backgroundSize: 'cover',
          filter: fx === 'grayscale' ? 'grayscale(0.7) contrast(0.9)' : fx === 'contrast' ? 'contrast(1.2) saturate(1.1)' : undefined,
          maskImage: torn ? 'radial-gradient(140%_140% at 0 0, transparent 0 18px, black 19px), radial-gradient(140%_140% at 100% 0, transparent 0 18px, black 19px), radial-gradient(140%_140% at 0 100%, transparent 0 18px, black 19px), radial-gradient(140%_140% at 100% 100%, transparent 0 18px, black 19px)' : undefined,
          maskComposite: torn ? 'exclude' as any : undefined
        }}
      >
        {/* Drag-and-drop target */}
        <div
          className="absolute inset-0"
          onDragOver={(e)=>{e.preventDefault();}}
          onDrop={(e)=>{
            e.preventDefault()
            const data = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain')
            const src = data?.trim()
            if (src) {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              setNodes(prev => prev.concat({
                id: `n${Date.now()}`,
                src,
                x, y,
                r: 0,
                s: 0.6,
                z: Math.max(0, ...prev.map(p=>p.z))+1
              }))
            }
          }}
        />
        {halftone && (
          <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-20" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '6px 6px', color: '#000' }} />
        )}
        {nodes.sort((a,b)=>a.z-b.z).map(n => (
          <img
            key={n.id}
            src={n.src}
            onDoubleClick={() => bringToFront(n.id)}
            onPointerDown={(e) => { toggleSel(n.id, e.metaKey || e.ctrlKey); onPointerDown(e, n.id) }}
            className={`absolute cursor-grab select-none ${sel.has(n.id) ? 'ring-2 ring-hotpink' : ''}`}
            style={{
              left: n.x,
              top: n.y,
              transform: `translate(-50%, -50%) rotate(${n.r}deg) scale(${n.s})`,
              transformOrigin: 'center center',
              zIndex: n.z
            }}
            alt="Sticker"
            draggable={false}
          />
        ))}
      </div>
      <p className="text-xs text-ink/60">Hint: drag to move; hold Shift to rotate; Alt to scale; double‑click to bring to front; Cmd/Ctrl for multi‑select.</p>
    </div>
  )
}
