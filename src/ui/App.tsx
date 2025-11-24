import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Convert from './pages/tools/Convert'
import Resize from './pages/tools/Resize'
import Compress from './pages/tools/Compress'
import Crop from './pages/tools/Crop'
import RotateFlip from './pages/tools/RotateFlip'

export default function App() {
  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur dark:bg-gray-900/70">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Image Tools</Link>
          <nav className="flex gap-4">
            <NavLink to="/tool/convert" className={({isActive})=>isActive? 'text-indigo-600':'text-gray-600'}>Convert</NavLink>
            <NavLink to="/tool/resize" className={({isActive})=>isActive? 'text-indigo-600':'text-gray-600'}>Resize</NavLink>
            <NavLink to="/tool/compress" className={({isActive})=>isActive? 'text-indigo-600':'text-gray-600'}>Compress</NavLink>
            <NavLink to="/tool/crop" className={({isActive})=>isActive? 'text-indigo-600':'text-gray-600'}>Crop</NavLink>
            <NavLink to="/tool/rotate" className={({isActive})=>isActive? 'text-indigo-600':'text-gray-600'}>Rotate/Flip</NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tool/convert" element={<Convert />} />
          <Route path="/tool/resize" element={<Resize />} />
          <Route path="/tool/compress" element={<Compress />} />
          <Route path="/tool/crop" element={<Crop />} />
          <Route path="/tool/rotate" element={<RotateFlip />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-12 text-sm text-gray-500">
        <p>Fast, private image tools — client-side where possible.</p>
      </footer>
    </div>
  )
}