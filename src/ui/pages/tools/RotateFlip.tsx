import { useEffect, useState } from 'react'
import UploadArea from '../../components/UploadArea'
import { fileToImage, rotateFlip, canvasToBlob } from '../../../lib/image'

export default function RotateFlip(){
  const [blob, setBlob] = useState<Blob | null>(null)
  const [degrees, setDegrees] = useState(90)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [type, setType] = useState<'image/jpeg'|'image/png'|'image/webp'>('image/png')
  const [quality, setQuality] = useState(0.9)
  const [last, setLast] = useState<Blob | null>(null)

  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if (e.key.toLowerCase()==='r') setDegrees(d=> (d+90)%360)
      if (e.key.toLowerCase()==='z') setBlob(last)
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [last])

  async function handleFiles(files: File[]){
    const file = files[0]
    const img = await fileToImage(file)
    const canvas = rotateFlip(img, degrees, flipH, flipV)
    const out = await canvasToBlob(canvas, type, type==='image/png'? undefined : quality)
    setLast(blob)
    setBlob(out)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Rotate / Flip</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <UploadArea onFiles={handleFiles} />
          {blob && (
            <div className="mt-4 flex items-center gap-4">
              <a className="px-4 py-2 bg-indigo-600 text-white rounded focus-ring" href={URL.createObjectURL(blob)} download={`rotated.${type.split('/')[1]}`}>Apply & Download</a>
              <button className="px-4 py-2 border rounded focus-ring" onClick={()=> setBlob(last)}>Undo</button>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <label className="block">
            <span className="block text-sm">Rotate (degrees)</span>
            <input className="mt-1 border rounded px-2 py-1 w-full" type="number" value={degrees} onChange={(e)=> setDegrees(parseInt(e.target.value||'0'))} />
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={flipH} onChange={(e)=> setFlipH(e.target.checked)} />
            <span>Flip horizontally</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={flipV} onChange={(e)=> setFlipV(e.target.checked)} />
            <span>Flip vertically</span>
          </label>
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