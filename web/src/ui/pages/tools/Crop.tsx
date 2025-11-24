import { useState } from 'react'
import UploadArea from '../../components/UploadArea'
import { fileToImage, cropToRatio, canvasToBlob } from '../../../lib/image'

export default function Crop(){
  const [blob, setBlob] = useState<Blob | null>(null)
  const [ratio, setRatio] = useState<{w:number,h:number}>({ w: 1, h: 1 })
  const [type, setType] = useState<'image/jpeg'|'image/png'|'image/webp'>('image/png')
  const [quality, setQuality] = useState(0.9)

  async function handleFiles(files: File[]){
    const file = files[0]
    const img = await fileToImage(file)
    const canvas = cropToRatio(img, ratio.w, ratio.h)
    const out = await canvasToBlob(canvas, type, type==='image/png'? undefined : quality)
    setBlob(out)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Crop / Change Ratio</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <UploadArea onFiles={handleFiles} />
          {blob && (
            <div className="mt-4 flex items-center gap-4">
              <a className="px-4 py-2 bg-indigo-600 text-white rounded focus-ring" href={URL.createObjectURL(blob)} download={`cropped.${type.split('/')[1]}`}>Apply & Download</a>
              <button className="px-4 py-2 border rounded focus-ring" onClick={()=> setBlob(null)}>Undo</button>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <label className="block">
            <span className="block text-sm">Ratio preset</span>
            <select className="mt-1 border rounded px-2 py-1 w-full" value={`${ratio.w}:${ratio.h}`} onChange={(e)=>{
              const [w,h] = e.target.value.split(':').map(n=> parseInt(n))
              setRatio({ w, h })
            }}>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-sm">Custom W</span>
              <input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={ratio.w} onChange={(e)=> setRatio(r=> ({...r, w: parseInt(e.target.value||'1')}))} />
            </label>
            <label className="block">
              <span className="block text-sm">Custom H</span>
              <input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={ratio.h} onChange={(e)=> setRatio(r=> ({...r, h: parseInt(e.target.value||'1')}))} />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm">Output format</span>
            <select className="mt-1 border rounded px-2 py-1 w-full" value={type} onChange={(e)=> setType(e.target.value as any)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
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