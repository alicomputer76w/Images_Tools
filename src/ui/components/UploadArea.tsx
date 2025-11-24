import React, { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  onFiles: (files: File[]) => void
}

export default function UploadArea({ onFiles }: Props) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(()=>{
    function onKey(e: KeyboardEvent){
      if (e.key.toLowerCase()==='u') inputRef.current?.click()
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const fs = Array.from(e.dataTransfer.files || [])
    if (fs.length) onFiles(fs)
  }, [onFiles])

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const fs = items.filter(i => i.kind === 'file').map(i => i.getAsFile()).filter(Boolean) as File[]
    if (fs.length) onFiles(fs)
  }, [onFiles])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drag and drop images or click to upload"
      onKeyDown={(e)=>{ if(e.key==='Enter') inputRef.current?.click() }}
      className={"border-2 border-dashed rounded-lg p-8 text-center select-none " + (drag? 'border-indigo-500 bg-indigo-50':'border-gray-300')}
      onDragOver={(e)=>{ e.preventDefault(); setDrag(true) }}
      onDragLeave={()=> setDrag(false)}
      onDrop={onDrop}
      onPaste={onPaste}
      onClick={()=> inputRef.current?.click()}
    >
      <p className="mb-2 font-medium">Drag & drop images here or click to upload.</p>
      <p className="text-sm text-gray-500">Max 25 MB per file (free).</p>
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e)=>{
        const files = Array.from(e.target.files || [])
        if (files.length) onFiles(files)
      }} />
    </div>
  )
}