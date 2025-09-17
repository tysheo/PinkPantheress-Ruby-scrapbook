export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove(key: string) {
    try { localStorage.removeItem(key) } catch {}
  }
}

export const LS_KEYS = {
  collage: 'ruby.collage.layout',
  audioPos: 'ruby.audio.position',
  note: 'ruby.note.content'
}
