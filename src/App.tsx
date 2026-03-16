import { useEffect, useRef } from 'react'
import { useStore } from './store/editorStore'
import Toolbar from './components/Toolbar/Toolbar'
import Canvas from './components/Canvas/Canvas'
import Timeline from './components/Timeline/Timeline'
import Inspector from './components/Inspector/Inspector'

export default function App() {
  const { togglePlay, setCurrentTime, pause, project, currentTime } = useStore()
  const rafRef = useRef<number>()

  useEffect(() => {
    let lastTime = 0
    const loop = (time: number) => {
      if (useStore.getState().isPlaying) {
        const dt = (time - lastTime) / 1000
        lastTime = time
        const s = useStore.getState()
        let nt = s.currentTime + dt
        if (nt >= s.project.duration) { nt = s.project.duration; pause() }
        useStore.getState().setCurrentTime(nt)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => rafRef.current && cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === ' ') { e.preventDefault(); togglePlay() }
      if (e.key === 'ArrowLeft') setCurrentTime(Math.max(0, currentTime - 0.1))
      if (e.key === 'ArrowRight') setCurrentTime(Math.min(project.duration, currentTime + 0.1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, setCurrentTime, currentTime, project.duration])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    Array.from(e.dataTransfer.files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => useStore.getState().addAsset({ name: file.name, type: 'image', src: ev.target?.result as string })
        reader.readAsDataURL(file)
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#0a0a0a', color: '#fff' }} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}><Canvas /></div>
        <Inspector />
      </div>
      <Timeline />
    </div>
  )
}
