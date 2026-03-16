import { useStore } from '../../store/editorStore'

export default function Inspector() {
  const { selectedClipIds, clips, updateClip, removeClip } = useStore()
  const clip = selectedClipIds.length === 1 ? clips.find(c => c.id === selectedClipIds[0]) : null

  if (!clip) {
    return (
      <div style={{ width: 280, background: '#141414', borderLeft: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#444', fontSize: 13 }}>Select a clip to edit</p>
      </div>
    )
  }

  const transitionTypes = ['slide', 'zoom', 'tilt', 'blur', 'parallax', 'fade'] as const

  return (
    <div style={{ width: 280, background: '#141414', borderLeft: '1px solid #2a2a2a', padding: 12, overflow: 'auto' }}>
      <h3 style={{ fontSize: 14, marginBottom: 16 }}>Clip Inspector</h3>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Opacity</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={clip.opacity}
          onChange={(e) => updateClip(clip.id, { opacity: parseFloat(e.target.value) })} 
          style={{ width: '100%' }} 
        />
        <span style={{ fontSize: 11, color: '#888' }}>{Math.round(clip.opacity * 100)}%</span>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Position X</label>
        <input 
          type="number" 
          value={clip.transform.positionX}
          onChange={(e) => updateClip(clip.id, { transform: { ...clip.transform, positionX: parseFloat(e.target.value) } })}
          style={{ width: '100%', padding: 6, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 4, color: '#fff' }} 
        />
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Position Y</label>
        <input 
          type="number" 
          value={clip.transform.positionY}
          onChange={(e) => updateClip(clip.id, { transform: { ...clip.transform, positionY: parseFloat(e.target.value) } })}
          style={{ width: '100%', padding: 6, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 4, color: '#fff' }} 
        />
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Scale</label>
        <input 
          type="number" 
          value={clip.transform.scaleX} 
          step="0.1"
          onChange={(e) => updateClip(clip.id, { transform: { ...clip.transform, scaleX: parseFloat(e.target.value), scaleY: parseFloat(e.target.value) } })}
          style={{ width: '100%', padding: 6, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 4, color: '#fff' }} 
        />
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 4 }}>Rotation</label>
        <input 
          type="number" 
          value={clip.transform.rotationZ}
          onChange={(e) => updateClip(clip.id, { transform: { ...clip.transform, rotationZ: parseFloat(e.target.value) } })}
          style={{ width: '100%', padding: 6, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 4, color: '#fff' }} 
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 8 }}>Transitions</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {transitionTypes.map(t => (
            <button 
              key={t} 
              onClick={() => useStore.getState().addTransition(t, clip.id, '')}
              style={{ padding: '4px 8px', background: '#1a1a1a', borderRadius: 4, fontSize: 10, color: '#888', border: 'none', cursor: 'pointer' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => removeClip(clip.id)} 
        style={{ width: '100%', padding: 8, background: '#ef4444', borderRadius: 4, color: '#fff', fontSize: 12, border: 'none', cursor: 'pointer' }}
      >
        Delete Clip
      </button>
    </div>
  )
}
