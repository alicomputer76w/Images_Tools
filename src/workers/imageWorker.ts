export type ImageTask =
  | { kind: 'resize', blob: Blob, width: number, height: number, type: string, quality?: number }
  | { kind: 'convert', blob: Blob, type: string, quality?: number }
  | { kind: 'compress', blob: Blob, type: string, quality: number }
  | { kind: 'crop', blob: Blob, ratioW: number, ratioH: number, type: string, quality?: number }
  | { kind: 'rotate', blob: Blob, degrees: number, flipH: boolean, flipV: boolean, type: string, quality?: number }

async function bitmapFromBlob(blob: Blob): Promise<ImageBitmap> {
  return await createImageBitmap(blob)
}

self.onmessage = async (e: MessageEvent<ImageTask>) => {
  const task = e.data
  try {
    const bmp = await bitmapFromBlob(task.blob)
    let canvas: OffscreenCanvas
    switch (task.kind) {
      case 'resize': {
        canvas = new OffscreenCanvas(task.width, task.height)
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(bmp, 0, 0, task.width, task.height)
        break
      }
      case 'convert': {
        canvas = new OffscreenCanvas(bmp.width, bmp.height)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(bmp, 0, 0)
        break
      }
      case 'compress': {
        canvas = new OffscreenCanvas(bmp.width, bmp.height)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(bmp, 0, 0)
        break
      }
      case 'crop': {
        const targetRatio = task.ratioW / task.ratioH
        const currentRatio = bmp.width / bmp.height
        let sx = 0, sy = 0, sw = bmp.width, sh = bmp.height
        if (currentRatio > targetRatio) {
          sw = Math.round(bmp.height * targetRatio)
          sx = Math.round((bmp.width - sw) / 2)
        } else {
          sh = Math.round(bmp.width / targetRatio)
          sy = Math.round((bmp.height - sh) / 2)
        }
        canvas = new OffscreenCanvas(sw, sh)
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, sw, sh)
        break
      }
      case 'rotate': {
        const radians = (task.degrees % 360) * Math.PI / 180
        const sin = Math.abs(Math.sin(radians))
        const cos = Math.abs(Math.cos(radians))
        const outW = Math.round(bmp.width * cos + bmp.height * sin)
        const outH = Math.round(bmp.width * sin + bmp.height * cos)
        canvas = new OffscreenCanvas(outW, outH)
        const ctx = canvas.getContext('2d')!
        ctx.translate(outW / 2, outH / 2)
        ctx.rotate(radians)
        ctx.scale(task.flipH ? -1 : 1, task.flipV ? -1 : 1)
        ctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2)
        break
      }
    }
    const blob = await canvas.convertToBlob({ type: (task as any).type, quality: (task as any).quality });
    (self as any).postMessage({ ok: true, blob })
  } catch (err) {
    (self as any).postMessage({ ok: false, error: String(err) })
  }
}