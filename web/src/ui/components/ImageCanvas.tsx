import { useEffect, useRef } from 'react'

type Props = {
  image: HTMLImageElement | null
}

export default function ImageCanvas({ image }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(()=>{
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    ctx.drawImage(image, 0, 0)
  }, [image])
  return <canvas ref={canvasRef} className="max-w-full h-auto border rounded" />
}