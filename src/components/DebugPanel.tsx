import { LS_KEYS, storage } from '../lib/storage'

export default function DebugPanel() {
  const params = new URLSearchParams(location.search)
  if (!params.has('debug')) return null
  const reset = () => {
    storage.remove(LS_KEYS.audioPos)
    storage.remove(LS_KEYS.collage)
    storage.remove(LS_KEYS.note)
    location.reload()
  }
  return (
    <div className="fixed top-4 right-4 bg-white/90 border border-ink/10 rounded-card p-3 shadow-card z-50">
      <div className="font-semibold mb-2">Debug</div>
      <button className="btn" onClick={reset}>Reset all</button>
    </div>
  )
}
