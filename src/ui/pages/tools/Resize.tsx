import { useEffect, useRef, useState } from 'react'
import UploadArea from '../../components/UploadArea'
import { fileToImage, resizeImage, canvasToBlob } from '../../../lib/image'
const worker = typeof Worker !== 'undefined' ? new Worker(new URL('../../../workers/imageWorker.ts', import.meta.url), { type: 'module' }) : null

export default function Resize(){
  const [blob, setBlob] = useState<Blob | null>(null)
  const downloadRef = useRef<HTMLAnchorElement | null>(null)
  const [maintain, setMaintain] = useState(true)
  const [quality, setQuality] = useState(0.9)
  const [dims, setDims] = useState({ width: 1024, height: 768 })
  const [type, setType] = useState<'image/jpeg'|'image/png'|'image/webp'>('image/jpeg')
  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if (e.key.toLowerCase()==='s' && downloadRef.current) downloadRef.current.click()
      if (e.key.toLowerCase()==='z') setBlob(null)
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [downloadRef])

  async function handleFiles(files: File[]){
    const file = files[0]
    if (worker) {
      const imgTmp = await fileToImage(file)
      const ratio = imgTmp.naturalWidth / imgTmp.naturalHeight
      const target = maintain ? { width: dims.width, height: Math.round(dims.width/ratio) } : dims
      const res = await new Promise<{ ok: boolean, blob?: Blob }>((resolve) => {
        worker.onmessage = (ev)=> resolve(ev.data)
        worker.postMessage({ kind: 'resize', blob: file, width: target.width, height: target.height, type, quality: type==='image/png'? undefined : quality })
      })
      if (res.ok && res.blob) setBlob(res.blob)
    } else {
      const img = await fileToImage(file)
      const ratio = img.naturalWidth / img.naturalHeight
      const target = maintain ? { width: dims.width, height: Math.round(dims.width/ratio) } : dims
      const canvas = resizeImage(img, target.width, target.height)
      const out = await canvasToBlob(canvas, type, type==='image/png'? undefined : quality)
      setBlob(out)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Resize</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <UploadArea onFiles={handleFiles} />
          {blob && (
            <div className="mt-4 flex items-center gap-4">
              <a ref={downloadRef} className="px-4 py-2 bg-indigo-600 text-white rounded focus-ring" href={URL.createObjectURL(blob)} download={`resized.${type.split('/')[1]}`}>Apply & Download</a>
              <button className="px-4 py-2 border rounded focus-ring" onClick={()=> setBlob(null)}>Undo</button>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-sm">Width</span>
              <input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={dims.width} onChange={(e)=> setDims(d=> ({...d, width: parseInt(e.target.value||'0')}))} />
            </label>
            <label className="block">
              <span className="block text-sm">Height</span>
              <input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={dims.height} onChange={(e)=> setDims(d=> ({...d, height: parseInt(e.target.value||'0')}))} disabled={maintain} />
            </label>
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={maintain} onChange={(e)=> setMaintain(e.target.checked)} />
            <span>Maintain aspect</span>
          </label>
          <label className="block">
            <span className="block text-sm">Output format</span>
            <select className="mt-1 border rounded px-2 py-1 w-full" value={type} onChange={(e)=> setType(e.target.value as any)}>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
          {type!=='image/png' && (
            <label className="block">
              <span className="block text-sm">Quality</span>
              <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e)=> setQuality(parseFloat(e.target.value))} />
            </label>
          )}
        </aside>
      </div>
    </div>
  )
}