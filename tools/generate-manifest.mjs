#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ASSETS = path.join(ROOT, 'assets')

const exts = (arr) => new RegExp(`\.(${arr.join('|')})$`, 'i')
const exImg = exts(['png','jpg','jpeg','webp','gif','svg'])
const exCover = exts(['png','jpg','jpeg','webp','svg'])
const exAudio = exts(['mp3','ogg'])

async function walk(dir) {
  const out = []
  const ents = await fs.readdir(dir, { withFileTypes: true })
  for (const e of ents) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(p))
    else out.push(p)
  }
  return out
}

function rel(p) { return encodeURI(path.relative(ROOT, p).split(path.sep).join('/')) }

function captionFrom(filename) {
  const base = decodeURI(path.basename(filename)).replace(/\.[^.]+$/, '')
  return base.replace(/[\-_]+/g, ' ').trim()
}

async function loadStickerManifest() {
  try {
    const p = path.join(ASSETS, 'collage-manifest.json')
    const raw = await fs.readFile(p, 'utf8')
    const json = JSON.parse(raw)
    return Array.isArray(json) ? json : (json.stickers || [])
  } catch { return [] }
}

async function computePalette(images) {
  const { createCanvas, loadImage } = await import('canvas').catch(()=>({}))
  if (!createCanvas || !loadImage || images.length === 0) return ['#ff7aa2', '#ff4d84', '#1b1b1b', '#fff6ee', '#f7f2ee']
  const cvs = createCanvas(80, 80)
  const ctx = cvs.getContext('2d')
  for (const imgPath of images.slice(0,3)) {
    try {
      const img = await loadImage(imgPath)
      ctx.drawImage(img, 0, 0, 80, 80)
    } catch {}
  }
  const { data } = ctx.getImageData(0,0,80,80)
  // simple median-cut-ish: sample every 4th pixel and k-means 5 clusters
  const samples = []
  for (let i=0;i<data.length;i+=16) samples.push([data[i],data[i+1],data[i+2]])
  const k = 5
  let centers = samples.filter((_,i)=>i%(Math.floor(samples.length/k))===0).slice(0,k)
  for (let iter=0; iter<6; iter++) {
    const buckets = Array.from({length:k},()=>[])
    for (const s of samples) {
      let bi=0, bd=1e9
      centers.forEach((c,ci)=>{const d=(s[0]-c[0])**2+(s[1]-c[1])**2+(s[2]-c[2])**2; if(d<bd){bd=d;bi=ci}})
      buckets[bi].push(s)
    }
    centers = buckets.map(b=>{
      if (!b.length) return centers[0]
      const m=b.reduce((a,c)=>[a[0]+c[0],a[1]+c[1],a[2]+c[2]],[0,0,0])
      return [Math.round(m[0]/b.length),Math.round(m[1]/b.length),Math.round(m[2]/b.length)]
    })
  }
  const hex = (n)=>n.toString(16).padStart(2,'0')
  return centers.map(c=>`#${hex(c[0])}${hex(c[1])}${hex(c[2])}`)
}

async function main() {
  const files = await walk(ASSETS)
  const songDir = path.join(ASSETS, 'song')
  const photosDir = path.join(ASSETS, 'photos')
  const stickersDir = path.join(ASSETS, 'collage assets')
  const backgroundsDir = path.join(ASSETS, 'backgrounds')
  const styleDir = path.join(ASSETS, 'style guide')

  const audioFiles = files.filter(f => f.startsWith(songDir) && exAudio.test(f))
  const coverFiles = files.filter(f => f.startsWith(songDir) && exCover.test(f))
  const cover = coverFiles.sort((a,b)=>/cover/i.test(b)?1:-1).find(f=>/cover/i.test(f)) || coverFiles[0]
  const audio = audioFiles[0]

  const stickerFiles = files.filter(f => f.startsWith(stickersDir) && exImg.test(f))
  const memoryFiles = files.filter(f => f.startsWith(photosDir) && exImg.test(f))
  const textures = files.filter(f => f.startsWith(backgroundsDir) && exImg.test(f))
  const styleImgs = files.filter(f => f.startsWith(styleDir) && exImg.test(f))

  const stickers = stickerFiles.map(f => ({ src: rel(f) }))
  const memories = memoryFiles.map(f => ({ src: rel(f), caption: captionFrom(f) }))
  const palette = await computePalette(styleImgs)

  // merge collage-manifest if exists
  const extra = await loadStickerManifest()
  const map = new Map(stickers.map(s => [s.src, s]))
  for (const s of extra) {
    if (s.src && map.has(s.src)) Object.assign(map.get(s.src), s)
  }

  const manifest = {
    audio: audio ? { src: rel(audio), cover: cover ? rel(cover) : undefined } : undefined,
    stickers: Array.from(map.values()),
    memories,
    textures: textures.length ? [rel(textures[0])] : [],
    palette
  }

  const outPath = path.join(ASSETS, '_manifest.json')
  await fs.writeFile(outPath, JSON.stringify(manifest, null, 2))
  console.log('Wrote', rel(outPath))
}

main().catch(e => { console.error(e); process.exit(1) })
