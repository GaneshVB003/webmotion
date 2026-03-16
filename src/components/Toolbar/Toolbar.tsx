import { useStore } from '../../store/editorStore'

export default function Toolbar() {
  const { isPlaying, togglePlay, play, pause, zoom, setZoom, project, addClip } = useStore()

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const assetId = useStore.getState().addAsset({ name: file.name, type: 'image', src: ev.target?.result as string })
          addClip(assetId)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, padding: '0 16px', background: '#141414', borderBottom: '1px solid #2a2a2a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600, background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WebMotion</span>
        <button onClick={handleImport} style={{ padding: '6px 12px', background: '#6366f1', borderRadius: 6, color: '#fff', fontSize: 12, border: 'none', cursor: 'pointer' }}>Import Media</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={isPlaying ? pause : play} style={{ width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer' }}>{isPlaying ? '||' : '>'}</button>
        <span style={{ color: '#888', fontSize: 12 }}>{project.width}x{project.height}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setZoom(zoom / 1.2)} style={{ width: 28, height: 28, borderRadius: 4, background: '#1a1a1a', color: '#888', border: 'none', cursor: 'pointer' }}>-</button>
        <span style={{ color: '#666', fontSize: 11, minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom * 1.2)} style={{ width: 28, height: 28, borderRadius: 4, background: '#1a1a1a', color: '#888', border: 'none', cursor: 'pointer' }}>+</button>
      </div>
    </div>
  )
}
