export async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  return new Promise((resolve, reject)=>{
    const img = new Image()
    img.onload = ()=> resolve(img)
    img.onerror = (e)=> reject(e)
    img.src = url
  })
}

export async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve)=>{
    canvas.toBlob((b)=> resolve(b!), type, quality)
  })
}

export function resizeImage(img: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

export function convertImage(img: HTMLImageElement, type: 'image/jpeg'|'image/png'|'image/webp'|'image/avif', quality?: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvasToBlob(canvas, type, quality)
}

export function compressImage(img: HTMLImageElement, type: 'image/jpeg'|'image/webp', quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvasToBlob(canvas, type, quality)
}

export function cropToRatio(img: HTMLImageElement, ratioW: number, ratioH: number): HTMLCanvasElement {
  const srcW = img.naturalWidth
  const srcH = img.naturalHeight
  const targetRatio = ratioW / ratioH
  const currentRatio = srcW / srcH
  let sx = 0, sy = 0, sw = srcW, sh = srcH
  if (currentRatio > targetRatio) {
    sw = Math.round(srcH * targetRatio)
    sx = Math.round((srcW - sw) / 2)
  } else {
    sh = Math.round(srcW / targetRatio)
    sy = Math.round((srcH - sh) / 2)
  }
  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  return canvas
}

export function rotateFlip(img: HTMLImageElement, degrees: number, flipH: boolean, flipV: boolean): HTMLCanvasElement {
  const radians = (degrees % 360) * Math.PI / 180
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))
  const w = img.naturalWidth
  const h = img.naturalHeight
  const outW = Math.round(w * cos + h * sin)
  const outH = Math.round(w * sin + h * cos)
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')!
  ctx.translate(outW / 2, outH / 2)
  ctx.rotate(radians)
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  ctx.drawImage(img, -w / 2, -h / 2)
  return canvas
}