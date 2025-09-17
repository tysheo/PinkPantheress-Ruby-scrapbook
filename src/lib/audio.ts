import { storage, LS_KEYS } from './storage'

export function initAudio(audio: HTMLAudioElement) {
  const last = storage.get<number>(LS_KEYS.audioPos, 0)
  if (!isNaN(last) && last > 0) audio.currentTime = last
  audio.addEventListener('timeupdate', () => {
    storage.set(LS_KEYS.audioPos, Math.floor(audio.currentTime))
  })
}

export const formatTime = (s: number) => {
  if (!isFinite(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}
