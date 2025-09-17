import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { formatTime, initAudio } from '../lib/audio'

type Props = { manifest?: any | null }

export default function Player({ manifest }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [dur, setDur] = useState(0)
  const [muted, setMuted] = useState(false)

  const audioSrc = useMemo(() => manifest?.audio?.src ?? 'assets/song/PinkPantheress%20-%20Nice%20To%20Know%20You%20(Official%20Lyric%20Video).mp3', [manifest])
  const cover = useMemo(() => manifest?.audio?.cover ?? 'assets/album_cover.png', [manifest])

  useEffect(() => {
    const a = audioRef.current!
    initAudio(a)
    const t = () => setTime(a.currentTime)
    const d = () => setDur(a.duration)
    a.addEventListener('timeupdate', t)
    a.addEventListener('loadedmetadata', d)
    return () => { a.removeEventListener('timeupdate', t); a.removeEventListener('loadedmetadata', d) }
  }, [])

  // Auto-play after first interaction (gesture) only
  useEffect(() => {
    const onFirst = () => {
      const a = audioRef.current!
      if (a.paused) a.play().catch(()=>{})
      window.removeEventListener('pointerdown', onFirst)
    }
    window.addEventListener('pointerdown', onFirst, { once: true })
    return () => window.removeEventListener('pointerdown', onFirst)
  }, [])

  const toggle = () => {
    const a = audioRef.current!
    if (a.paused) { a.play(); setPlaying(true) } else { a.pause(); setPlaying(false) }
  }

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    const a = audioRef.current!
    a.currentTime = v * dur
  }

  const pct = dur ? time / dur : 0

  return (
    <div className="bg-cream/70 border border-ink/10 rounded-card p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-center">
      <div className="relative">
        <img src={cover} alt="Album cover" className="w-40 h-40 object-cover rounded-xl shadow-card" />
        <div className="pointer-events-none absolute inset-0 rounded-xl" style={{background: 'linear-gradient(180deg, rgba(255,255,255,.3), rgba(255,255,255,0))'}} />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button className="btn" aria-label={playing? 'Pause' : 'Play'} onClick={toggle}>
            {playing ? <Pause size={18}/> : <Play size={18}/>}<span>{playing? 'Pause' : 'Play'}</span>
          </button>
          <button className="btn" aria-label={muted? 'Unmute' : 'Mute'} onClick={() => { const a = audioRef.current!; a.muted = !a.muted; setMuted(a.muted) }}>
            {muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
          </button>
          <div className="ml-auto text-sm tabular-nums text-ink/70">{formatTime(time)} / {formatTime(dur)}</div>
        </div>
        <input aria-label="Seek" type="range" min={0} max={1} step={0.001} value={pct} onChange={onSeek}
               className="w-full h-2 bg-white/70 rounded-full appearance-none accent-pink" />
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
        <div className="text-xs text-ink/60">Tip: Drag photos into the collage area to add them.</div>
      </div>
    </div>
  )
}
