/// <reference types="vite/client" />

interface ImportMeta {
  glob: (pattern: string, opts?: { eager?: boolean; as?: string }) => Record<string, unknown>
}
