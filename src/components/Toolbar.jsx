import { useState, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, 
  ChevronLeft, ChevronRight, Repeat,
  ZoomIn, ZoomOut, Maximize, Minimize
} from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';

function Toolbar() {
  const {
    project,
    currentTime,
    duration,
    frameRate,
    isPlaying,
    isLooping,
    zoom,
    togglePlay,
    toggleLoop,
    setCurrentTime,
    goToStart,
    goToEnd,
    stepForward,
    stepBackward,
    setZoom,
    undo,
    redo,
    addLayer,
    selectedLayerIds,
    activeTool,
    setActiveTool,
    toggleLeftPanel,
    toggleRightPanel,
    toggleTimeline,
    showLeftPanel,
    showRightPanel,
    showTimeline
  } = useProjectStore();
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef(null);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * frameRate);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };
  
  const tools = [
    { id: 'select', icon: '↖', label: 'Select (V)' },
    { id: 'move', icon: '✥', label: 'Move (M)' },
    { id: 'rotate', icon: '⟲', label: 'Rotate (R)' },
    { id: 'scale', icon: '⤢', label: 'Scale (S)' },
    { id: 'text', icon: 'T', label: 'Text (T)' },
    { id: 'shape', icon: '□', label: 'Shape (U)' },
    { id: 'pen', icon: '✎', label: 'Pen (P)' },
    { id: 'eyedropper', icon: '💧', label: 'Eyedropper (I)' }
  ];
  
  const handleAddLayer = (type) => {
    addLayer(type);
    setShowAddMenu(false);
  };
  
  return (
    <div className="toolbar">
      <div className="toolbar-section toolbar-left">
        <div className="toolbar-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">WebMotion</span>
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="tool-group">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>
        
        <div className="toolbar-divider" />
        
        <div className="dropdown" ref={addMenuRef}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            + Add Layer
          </button>
          {showAddMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleAddLayer('shape')}>
                <span>□</span> Shape
              </div>
              <div className="dropdown-item" onClick={() => handleAddLayer('text')}>
                <span>T</span> Text
              </div>
              <div className="dropdown-item" onClick={() => handleAddLayer('solid')}>
                <span>■</span> Solid
              </div>
              <div className="dropdown-item" onClick={() => handleAddLayer('image')}>
                <span>🖼</span> Image
              </div>
              <div className="dropdown-item" onClick={() => handleAddLayer('video')}>
                <span>🎥</span> Video
              </div>
              <div className="dropdown-item" onClick={() => handleAddLayer('audio')}>
                <span>🔊</span> Audio
              </div>
              <div className="dropdown-item" onClick={() => handleAddLayer('group')}>
                <span>📁</span> Group
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="toolbar-section toolbar-center">
        <div className="playback-controls">
          <button 
            className="btn-icon" 
            onClick={goToStart}
            title="Go to start (Home)"
          >
            <SkipBack size={18} />
          </button>
          <button 
            className="btn-icon" 
            onClick={stepBackward}
            title="Step backward (Left Arrow)"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            className="btn-icon btn-play" 
            onClick={togglePlay}
            title="Play/Pause (Space)"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button 
            className="btn-icon" 
            onClick={stepForward}
            title="Step forward (Right Arrow)"
          >
            <ChevronRight size={18} />
          </button>
          <button 
            className="btn-icon" 
            onClick={goToEnd}
            title="Go to end (End)"
          >
            <SkipForward size={18} />
          </button>
          <button 
            className={`btn-icon ${isLooping ? 'active' : ''}`}
            onClick={toggleLoop}
            title="Toggle loop"
          >
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="time-display">
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="time-separator">/</span>
          <span className="total-time">{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="toolbar-section toolbar-right">
        <div className="zoom-controls">
          <button 
            className="btn-icon"
            onClick={() => setZoom(zoom / 1.2)}
            title="Zoom out (Ctrl+-)"
          >
            <ZoomOut size={18} />
          </button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button 
            className="btn-icon"
            onClick={() => setZoom(zoom * 1.2)}
            title="Zoom in (Ctrl++)"
          >
            <ZoomIn size={18} />
          </button>
        </div>
        
        <div className="toolbar-divider" />
        
        <button 
          className={`btn-icon ${showLeftPanel ? 'active' : ''}`}
          onClick={toggleLeftPanel}
          title="Toggle left panel"
        >
          <Minimize size={18} />
        </button>
        <button 
          className={`btn-icon ${showRightPanel ? 'active' : ''}`}
          onClick={toggleRightPanel}
          title="Toggle right panel"
        >
          <Maximize size={18} />
        </button>
        <button 
          className={`btn-icon ${showTimeline ? 'active' : ''}`}
          onClick={toggleTimeline}
          title="Toggle timeline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
        </button>
        
        <div className="toolbar-divider" />
        
        <button 
          className="btn-icon"
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
          </svg>
        </button>
        <button 
          className="btn-icon"
          onClick={redo}
          title="Redo (Ctrl+Y)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
          </svg>
        </button>
      </div>
      
      <style>{`
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--toolbar-height);
          padding: 0 12px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        
        .toolbar-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .toolbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-right: 12px;
        }
        
        .logo-icon {
          font-size: 20px;
        }
        
        .logo-text {
          font-weight: 600;
          font-size: 14px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--border-color);
          margin: 0 8px;
        }
        
        .tool-group {
          display: flex;
          gap: 2px;
        }
        
        .playback-controls {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--bg-tertiary);
          padding: 4px;
          border-radius: var(--radius-lg);
        }
        
        .btn-play {
          width: 36px;
          height: 36px;
          background: var(--accent-primary);
          color: white;
          border-radius: var(--radius-md);
        }
        
        .btn-play:hover {
          background: var(--accent-hover);
        }
        
        .time-display {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 0 12px;
        }
        
        .current-time {
          color: var(--text-primary);
        }
        
        .time-separator {
          color: var(--text-muted);
        }
        
        .total-time {
          color: var(--text-muted);
        }
        
        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .zoom-value {
          min-width: 48px;
          text-align: center;
          font-size: 12px;
          font-family: var(--font-mono);
          color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
          .toolbar-center {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Toolbar;
