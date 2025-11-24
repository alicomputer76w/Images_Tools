import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold">Fast, private image tools — convert, resize, compress, and edit images in your browser.</h1>
        <p className="mt-4 text-gray-600">Client-side first with privacy-friendly design. No tracking of image content.</p>
        <div className="mt-8">
          <Link to="/tool/convert" className="px-6 py-3 rounded bg-indigo-600 text-white focus-ring">Start editing</Link>
        </div>
      </section>
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard title="Convert" to="/tool/convert" desc="JPG, PNG, WebP, AVIF" />
        <ToolCard title="Resize" to="/tool/resize" desc="Maintain aspect, DPI" />
        <ToolCard title="Compress" to="/tool/compress" desc="Quality slider" />
      </section>
    </div>
  )
}

function ToolCard({ title, desc, to }: {title: string, desc: string, to: string}){
  return (
    <Link to={to} className="block border rounded-lg p-6 hover:border-indigo-500 focus-ring">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600 mt-2">{desc}</p>
      <span className="inline-block mt-4 text-indigo-600">Try now →</span>
    </Link>
  )
}