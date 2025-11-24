import { useEffect, useRef, useState } from 'react'
import UploadArea from '../../components/UploadArea'
import { fileToImage, compressImage } from '../../../lib/image'
const worker = typeof Worker !== 'undefined' ? new Worker(new URL('../../../workers/imageWorker.ts', import.meta.url), { type: 'module' }) : null

export default function Compress(){
  const [blob, setBlob] = useState<Blob | null>(null)
  const downloadRef = useRef<HTMLAnchorElement | null>(null)
  const [quality, setQuality] = useState(0.6)
  const [type, setType] = useState<'image/jpeg'|'image/webp'>('image/jpeg')
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
      const res = await new Promise<{ ok: boolean, blob?: Blob }>((resolve) => {
        worker.onmessage = (ev)=> resolve(ev.data)
        worker.postMessage({ kind: 'compress', blob: file, type, quality })
      })
      if (res.ok && res.blob) setBlob(res.blob)
    } else {
      const img = await fileToImage(file)
      const out = await compressImage(img, type, quality)
      setBlob(out)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Compress</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <UploadArea onFiles={handleFiles} />
          {blob && (
            <div className="mt-4 flex items-center gap-4">
              <a ref={downloadRef} className="px-4 py-2 bg-indigo-600 text-white rounded focus-ring" href={URL.createObjectURL(blob)} download={`compressed.${type.split('/')[1]}`}>Apply & Download</a>
              <button className="px-4 py-2 border rounded focus-ring" onClick={()=> setBlob(null)}>Undo</button>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <label className="block">
            <span className="block text-sm">Output format</span>
            <select className="mt-1 border rounded px-2 py-1 w-full" value={type} onChange={(e)=> setType(e.target.value as any)}>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm">Quality</span>
            <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e)=> setQuality(parseFloat(e.target.value))} />
          </label>
        </aside>
      </div>
    </div>
  )
}