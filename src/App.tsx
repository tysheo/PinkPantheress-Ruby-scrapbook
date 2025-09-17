import { useEffect, useMemo, useState } from 'react'
import HeaderTiles from './components/HeaderTiles'
import Player from './components/Player'
import CollageBoard from './components/CollageBoard'
import ScrapbookGrid from './components/ScrapbookGrid'
import LoveNote from './components/LoveNote'
import Footer from './components/Footer'
import FullscreenButton from './components/FullscreenButton'
import DebugPanel from './components/DebugPanel'
import { loadManifest, memoryUrls, stickerUrls } from './lib/images'
import AnimatedBackground from './components/AnimatedBackground'
import ScrollScenes from './components/ScrollScenes'
import FloatingCollage from './components/FloatingCollage'

export default function App() {
  const [manifest, setManifest] = useState<any | null>(null)
  const [noManifest, setNoManifest] = useState(false)

  useEffect(() => {
    loadManifest().then(m => {
      if (m) setManifest(m)
      else setNoManifest(true)
    })
  }, [])

  const stickers = useMemo(() => manifest?.stickers?.map((s: any) => s.src) ?? stickerUrls, [manifest])
  const memories = useMemo(() => manifest?.memories ?? memoryUrls.map(src => ({ src })), [manifest])
  const paper = manifest?.textures?.[0]

  return (
    <div className="min-h-screen">
      <AnimatedBackground textures={manifest?.textures ?? []} />
      {noManifest && (
        <div role="status" className="fixed top-3 left-1/2 -translate-x-1/2 bg-cream/95 border border-ink/10 rounded-full px-4 py-2 shadow-card z-50">
          No manifest yet — run <code>node tools/generate-manifest.mjs</code>
        </div>
      )}
      <main className="mx-auto max-w-[1100px] px-4 sm:px-6 md:px-8 space-y-16 py-10">
        <ScrollScenes stickers={stickers} photos={memories} />
        <header>
          <HeaderTiles />
        </header>

        <FloatingCollage stickers={stickers} photos={memories} />

        <section aria-label="Audio Player" className="paper-edge">
          <Player manifest={manifest} />
        </section>

        <section aria-label="Collage Board">
          <CollageBoard stickers={stickers} paper={paper} textures={manifest?.textures ?? []} />
        </section>

        <section aria-label="Scrapbook" className="space-y-6">
          <h2 className="tracking-[.2em] text-sm font-semibold text-ink/70">SCRAPBOOK</h2>
          <ScrapbookGrid memories={memories} />
        </section>

        <section aria-label="Love Note" className="space-y-6">
          <h2 className="tracking-[.2em] text-sm font-semibold text-ink/70">LOVE NOTE</h2>
          <LoveNote />
        </section>

        <Footer />
      </main>
      <FullscreenButton />
      <DebugPanel />
    </div>
  )
}
