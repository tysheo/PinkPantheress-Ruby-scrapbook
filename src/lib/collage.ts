import { storage, LS_KEYS } from './storage'

export type Node = { id: string; src: string; x: number; y: number; r: number; s: number; z: number }

export function loadLayout(fallback: Node[]) {
  return storage.get<Node[]>(LS_KEYS.collage, fallback)
}

export function saveLayout(nodes: Node[]) {
  storage.set(LS_KEYS.collage, nodes)
}

export async function exportPNG(nodes: Node[], size: { w: number; h: number }, paperUrl?: string, scale = 2) {
  const canvas = document.createElement('canvas')
  canvas.width = size.w * scale
  canvas.height = size.h * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  if (paperUrl) {
    const bg = await loadImage(paperUrl)
    const pattern = ctx.createPattern(bg, 'repeat')
    if (pattern) {
      ctx.fillStyle = pattern as any
      ctx.fillRect(0,0,size.w,size.h)
    }
  } else {
    ctx.fillStyle = '#f7f2ee'
    ctx.fillRect(0,0,size.w,size.h)
  }

  for (const n of [...nodes].sort((a,b)=>a.z-b.z)) {
    const img = await loadImage(n.src)
    const cx = n.x
    const cy = n.y
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((n.r * Math.PI)/180)
    const w = img.width * n.s
    const h = img.height * n.s
    ctx.drawImage(img, -w/2, -h/2, w, h)
    ctx.restore()
  }

  return canvas.toDataURL('image/png')
}

export function dl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}
