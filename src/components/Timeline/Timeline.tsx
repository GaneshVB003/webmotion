import { useRef, useEffect, useState } from 'react'
import { useStore } from '../../store/editorStore'

export default function Timeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { currentTime, setCurrentTime, project, zoom, clips, selectedClipIds, selectClip } = useStore()
  const pps = 100 * zoom

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return
    
    canvas.width = rect.width
    canvas.height = 120
    
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, 24)
    
    ctx.fillStyle = '#666'
    ctx.font = '10px Inter, sans-serif'
    for (let t = 0; t <= project.duration; t += 1) {
      const x = t * pps
      if (x < 0 || x > canvas.width) continue
      ctx.fillRect(x, 20, 1, 4)
      if (t % 5 === 0) {
        ctx.fillText(t + 's', x, 14)
      }
    }
    
    clips.forEach((clip, i) => {
      const x = clip.startTime * pps
      const w = clip.duration * pps
      const y = 28 + i * 28
      ctx.fillStyle = selectedClipIds.includes(clip.id) ? '#6366f1' : '#3b82f6'
      ctx.fillRect(x, y, w, 24)
      ctx.fillStyle = '#fff'
      ctx.font = '11px Inter, sans-serif'
      ctx.fillText(clip.id.slice(0, 8), x + 4, y + 16)
    })
    
    const px = currentTime * pps
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(px, 0)
    ctx.lineTo(px, canvas.height)
    ctx.stroke()
  }, [currentTime, project.duration, zoom, clips, selectedClipIds, pps])

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const time = x / pps
    setCurrentTime(Math.max(0, Math.min(time, project.duration)))
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    setCurrentTime(Math.max(0, Math.min(x / pps, project.duration)))
  }

  return (
    <div style={{ height: 120, borderTop: '1px solid #2a2a2a', background: '#0f0f0f' }}>
      <canvas 
        ref={canvasRef} 
        onMouseDown={handleMouseDown} 
        onMouseMove={handleMouseMove} 
        onMouseUp={() => setIsDragging(false)} 
        onMouseLeave={() => setIsDragging(false)}
        style={{ width: '100%', height: '100%', cursor: isDragging ? 'ew-resize' : 'default' }} 
      />
    </div>
  )
}
