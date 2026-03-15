import { useProjectStore } from '../stores/projectStore';
import { useState, useEffect } from 'react';

function StatusBar() {
  const [fps, setFps] = useState(60);
  const {
    project,
    currentTime,
    duration,
    frameRate,
    layers,
    selectedLayerIds,
    isPlaying,
    zoom,
    theme
  } = useProjectStore();
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * frameRate);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };
  
  const currentFrame = Math.floor(currentTime * frameRate);
  const totalFrames = Math.floor(duration * frameRate);
  
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-item">
          <span className="status-label">Frame:</span>
          <span className="status-value">{currentFrame} / {totalFrames}</span>
        </span>
        <span className="status-item">
          <span className="status-label">Time:</span>
          <span className="status-value">{formatTime(currentTime)}</span>
        </span>
        <span className="status-item">
          <span className="status-label">Duration:</span>
          <span className="status-value">{formatTime(duration)}</span>
        </span>
      </div>
      
      <div className="status-center">
        {isPlaying && <span className="status-playing">▶ Playing</span>}
      </div>
      
      <div className="status-right">
        <span className="status-item">
          <span className="status-label">Layers:</span>
          <span className="status-value">{layers.length}</span>
        </span>
        <span className="status-item">
          <span className="status-label">Selected:</span>
          <span className="status-value">{selectedLayerIds.length}</span>
        </span>
        <span className="status-item">
          <span className="status-label">Zoom:</span>
          <span className="status-value">{Math.round(zoom * 100)}%</span>
        </span>
        <span className="status-item">
          <span className="status-label">FPS:</span>
          <span className="status-value">{fps}</span>
        </span>
      </div>
      
      <style>{`
        .status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 24px;
          padding: 0 12px;
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border-color);
          font-size: 11px;
        }
        
        .status-left,
        .status-center,
        .status-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .status-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .status-label {
          color: var(--text-muted);
        }
        
        .status-value {
          font-family: var(--font-mono);
          color: var(--text-secondary);
        }
        
        .status-playing {
          color: var(--success);
          animation: pulse 1s ease infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default StatusBar;
