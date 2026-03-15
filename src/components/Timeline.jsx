import { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';

function Timeline({ height = 200 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    layers,
    layerOrder,
    currentTime,
    duration,
    frameRate,
    selectedLayerIds,
    markers,
    setCurrentTime,
    selectLayer
  } = useProjectStore();
  
  const [localZoom, setLocalZoom] = useState(1);
  const [localScrollX, setLocalScrollX] = useState(0);
  
  const pixelsPerSecond = 100 * localZoom;
  const rulerHeight = 30;
  const trackHeight = 36;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * frameRate);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };
  
  const timeToX = (time) => time * pixelsPerSecond - localScrollX;
  const xToTime = (x) => (x + localScrollX) / pixelsPerSecond;
  
  const getRulerInterval = (minInterval) => {
    const intervals = [0.1, 0.2, 0.5, 1, 2, 5, 10, 30, 60];
    return intervals.find(i => i >= minInterval) || 1;
  };
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const rect = containerRef.current.getBoundingClientRect();
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const w = rect.width;
    const h = height;
    
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, rulerHeight);
    
    const startTime = xToTime(0);
    const endTime = xToTime(w);
    const minInterval = 10 / pixelsPerSecond;
    const interval = getRulerInterval(minInterval);
    
    ctx.fillStyle = '#666';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    
    for (let time = Math.floor(startTime / interval) * interval; time <= endTime; time += interval) {
      const x = timeToX(time);
      const isMajor = time % (interval * 5) === 0;
      
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(x, rulerHeight - (isMajor ? 12 : 6));
      ctx.lineTo(x, rulerHeight);
      ctx.stroke();
      
      if (isMajor) {
        ctx.fillText(formatTime(time).split(':').slice(1).join(':'), x, rulerHeight - 16);
      }
    }
    
    const visibleTracks = Math.floor((h - rulerHeight) / trackHeight);
    const sortedLayers = layerOrder
      .map(id => layers.find(l => l.id === id))
      .filter(Boolean)
      .slice(0, visibleTracks);
    
    sortedLayers.forEach((layer, index) => {
      const y = rulerHeight + index * trackHeight;
      const isSelected = selectedLayerIds.includes(layer.id);
      
      ctx.fillStyle = isSelected ? '#1e1e2e' : index % 2 === 0 ? '#141414' : '#121212';
      ctx.fillRect(0, y, w, trackHeight - 1);
      
      ctx.strokeStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.moveTo(0, y + trackHeight - 1);
      ctx.lineTo(w, y + trackHeight - 1);
      ctx.stroke();
      
      ctx.fillStyle = layer.color || '#6366f1';
      ctx.beginPath();
      ctx.arc(20, y + trackHeight / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = layer.locked ? '#555' : '#ccc';
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(layer.name, 36, y + trackHeight / 2 + 4);
      
      if (!layer.visible) {
        ctx.fillStyle = '#444';
        ctx.fillText('👁', 140, y + trackHeight / 2 + 4);
      }
      
      if (layer.keyframes) {
        Object.entries(layer.keyframes).forEach(([property, keyframes]) => {
          keyframes.forEach(keyframe => {
            const x = timeToX(keyframe.time);
            if (x >= 0 && x <= w) {
              ctx.fillStyle = '#6366f1';
              ctx.beginPath();
              ctx.moveTo(x, y + trackHeight / 2 - 5);
              ctx.lineTo(x + 4, y + trackHeight / 2);
              ctx.lineTo(x, y + trackHeight / 2 + 5);
              ctx.lineTo(x - 4, y + trackHeight / 2);
              ctx.closePath();
              ctx.fill();
            }
          });
        });
      }
    });
    
    const playheadX = timeToX(currentTime);
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, h);
    ctx.stroke();
    
    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, rulerHeight - 1);
    ctx.lineTo(playheadX + 6, rulerHeight - 1);
    ctx.lineTo(playheadX, rulerHeight + 8);
    ctx.closePath();
    ctx.fill();
    
    markers.forEach(marker => {
      const x = timeToX(marker.time);
      if (x >= 0 && x <= w) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x, 0, 2, rulerHeight - 1);
        if (marker.label) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = '9px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(marker.label, x, 10);
        }
      }
    });
  }, [layers, layerOrder, currentTime, duration, localZoom, localScrollX, selectedLayerIds, markers, height, frameRate, pixelsPerSecond]);
  
  useEffect(() => {
    draw();
  }, [draw]);
  
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (y < rulerHeight) {
      setIsDragging(true);
      setCurrentTime(Math.max(0, Math.min(xToTime(x), duration)));
    } else {
      const trackIndex = Math.floor((y - rulerHeight) / trackHeight);
      const sortedLayers = layerOrder
        .map(id => layers.find(l => l.id === id))
        .filter(Boolean);
      
      if (sortedLayers[trackIndex]) {
        selectLayer(sortedLayers[trackIndex].id, e.shiftKey);
      }
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setCurrentTime(Math.max(0, Math.min(xToTime(x), duration)));
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setLocalZoom(z => Math.max(0.1, Math.min(z * delta, 10)));
    } else {
      setLocalScrollX(s => Math.max(0, s + e.deltaX + e.deltaY));
    }
  };
  
  return (
    <div ref={containerRef} className="timeline" style={{ height }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <style>{`
        .timeline {
          background: #0f0f0f;
          border-top: 1px solid var(--border-color);
          position: relative;
        }
        .timeline canvas {
          display: block;
        }
      `}</style>
    </div>
  );
}

export default Timeline;
