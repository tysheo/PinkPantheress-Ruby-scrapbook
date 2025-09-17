import { useEffect, useRef, useState } from 'react'
import { storage, LS_KEYS } from '../lib/storage'

const DEFAULT = "Happy 16 months, Ruby — I love you forever 💖\nEvery day with you is my favorite song."

export default function LoveNote() {
  const [typing, setTyping] = useState(true)
  const [text, setText] = useState(() => storage.get(LS_KEYS.note, ''))
  const [i, setI] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => { storage.set(LS_KEYS.note, text) }, [text])
  useEffect(() => {
    if (!typing) return
    if (text.length >= DEFAULT.length) return
    const t = setTimeout(() => {
      setText(DEFAULT.slice(0, text.length + 1))
    }, 24)
    return () => clearTimeout(t)
  }, [text, typing])

  const savePng = () => {
    const W = 900, H = 540
    const cvs = canvasRef.current || document.createElement('canvas')
    cvs.width = W; cvs.height = H
    const ctx = cvs.getContext('2d')!
    ctx.fillStyle = '#fff6ee'
    ctx.fillRect(0,0,W,H)
    ctx.strokeStyle = '#ff7aa2'
    ctx.lineWidth = 6
    roundRect(ctx, 20, 20, W-40, H-40, 24)
    ctx.stroke()
    ctx.font = '24px Inter, sans-serif'
    ctx.fillStyle = '#1b1b1b'
    wrapText(ctx, text || DEFAULT, 50, 80, W-100, 32)
    const a = document.createElement('a')
    a.href = cvs.toDataURL('image/png')
    a.download = 'love-note.png'
    a.click()
  }

  return (
    <div className="bg-cream/70 border border-ink/10 rounded-card p-4 sm:p-6 space-y-3">
      <div className="flex items-center gap-2 justify-between">
        <div className="tracking-[.2em] text-sm font-semibold text-ink/70">LOVE NOTE</div>
        <div className="flex gap-2">
          {typing && <button className="btn" onClick={() => setTyping(false)}>Skip typing</button>}
          <button className="btn" onClick={savePng}>Save as PNG</button>
        </div>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} aria-label="Love note"
        className="w-full rounded-xl border border-ink/10 p-4 bg-white/90 focus:outline-none focus:ring-2 focus:ring-pink shadow-card" />
      <div className="text-xs text-ink/60">{text.length} characters</div>
      <canvas ref={canvasRef} width={900} height={540} className="hidden" />
    </div>
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number) {
  ctx.beginPath()
  ctx.moveTo(x+r,y)
  ctx.arcTo(x+w,y,x+w,y+h,r)
  ctx.arcTo(x+w,y+h,x,y+h,r)
  ctx.arcTo(x,y+h,x,y,r)
  ctx.arcTo(x,y,x+w,y,r)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
}
