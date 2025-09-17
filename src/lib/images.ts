export type Manifest = {
  audio?: { src: string; cover?: string }
  stickers?: { src: string; tags?: string[]; x?: number; y?: number; r?: number; s?: number; z?: number }[]
  memories?: { src: string; caption?: string }[]
  textures?: string[]
  palette?: string[]
}

export async function loadManifest(): Promise<Manifest | null> {
  try {
    const res = await fetch('assets/_manifest.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('no manifest')
    return await res.json()
  } catch {
    try {
      const res = await fetch('assets/collage-manifest.json')
      if (res.ok) {
        const cm = await res.json()
        return { stickers: cm.stickers || cm }
      }
    } catch {}
    return null
  }
}

// Eager imports so users can drop files under src/assets as well
export const stickerUrls: string[] = Object.values(
  import.meta.glob('/src/assets/stickers/*', { eager: true, query: '?url', import: 'default' })
) as string[]

export const memoryUrls: string[] = Object.values(
  import.meta.glob('/src/assets/memories/*', { eager: true, query: '?url', import: 'default' })
) as string[]

export function captionFromPath(p: string) {
  const name = decodeURI(p.split('/').pop() || '')
  return name.replace(/\.[^.]+$/, '').replace(/[\-_]+/g, ' ').trim()
}
