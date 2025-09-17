import { useEffect, useState } from 'react'

export default function FullscreenButton() {
  const [fs, setFs] = useState(false)
  useEffect(() => {
    const onChange = () => setFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggle = async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    else await document.exitFullscreen()
  }
  return (
    <button className="fixed bottom-4 right-4 btn" onClick={toggle} aria-label="Toggle Fullscreen">
      {fs ? 'Exit Fullscreen' : 'Fullscreen'}
    </button>
  )
}
