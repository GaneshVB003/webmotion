import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useProjectStore } from '../stores/projectStore';

const Canvas = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  
  const {
    project,
    layers,
    layerOrder,
    currentTime,
    selectedLayerIds,
    selectLayer,
    activeTool,
    setLayerTransform,
    updateLayer,
    zoom
  } = useProjectStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragLayerStart, setDragLayerStart] = useState(null);
  
  // Update canvas dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const padding = 40;
        const aspectRatio = project.width / project.height;
        
        let width = rect.width - padding;
        let height = width / aspectRatio;
        
        if (height > rect.height - padding) {
          height = rect.height - padding;
          width = height * aspectRatio;
        }
        
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [project.width, project.height]);
  
  // Expose canvas ref
  useImperativeHandle(ref, () => canvasRef.current);
  
  // Handle mouse events for layer manipulation
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - dimensions.width / 2) / zoom;
    const y = (e.clientY - rect.top - dimensions.height / 2) / zoom;
    
    // Check if clicking on a selected layer
    const clickedLayer = findLayerAtPosition(x, y);
    
    if (clickedLayer && selectedLayerIds.includes(clickedLayer.id)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragLayerStart({ ...clickedLayer.transform });
    } else if (clickedLayer) {
      selectLayer(clickedLayer.id);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragLayerStart({ ...clickedLayer.transform });
    } else {
      selectLayer(null);
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || !dragLayerStart) return;
    
    const dx = (e.clientX - dragStart.x) / zoom;
    const dy = (e.clientY - dragStart.y) / zoom;
    
    selectedLayerIds.forEach(layerId => {
      const layer = layers.find(l => l.id === layerId);
      if (layer) {
        setLayerTransform(layerId, {
          x: dragLayerStart.x + dx,
          y: dragLayerStart.y + dy
        });
      }
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragLayerStart(null);
  };
  
  // Find layer at position
  const findLayerAtPosition = (x, y) => {
    // Check from top to bottom (reverse order)
    const sortedLayers = [...layers].reverse();
    
    for (const layer of sortedLayers) {
      if (!layer.visible || layer.locked) continue;
      
      const transform = layer.transform || {};
      const tx = transform.x || 0;
      const ty = transform.y || 0;
      const sx = transform.scaleX || 1;
      const sy = transform.scaleY || 1;
      
      // Simple bounding box check (simplified)
      const halfWidth = (project.width * 0.3 * sx) / 2;
      const halfHeight = (project.height * 0.3 * sy) / 2;
      
      if (
        x >= tx - halfWidth && x <= tx + halfWidth &&
        y >= ty - halfHeight && y <= ty + halfHeight
      ) {
        return layer;
      }
    }
    
    return null;
  };
  
  // Get cursor based on tool
  const getCursor = () => {
    switch (activeTool) {
      case 'move':
        return isDragging ? 'grabbing' : 'grab';
      case 'rotate':
        return 'crosshair';
      case 'scale':
        return 'nwse-resize';
      case 'text':
        return 'text';
      default:
        return 'default';
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="canvas-container"
      style={{ cursor: getCursor() }}
    >
      <div 
        className="canvas-wrapper"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width * window.devicePixelRatio}
          height={dimensions.height * window.devicePixelRatio}
          style={{
            width: dimensions.width,
            height: dimensions.height
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {/* Selection handles for selected layers */}
        {selectedLayerIds.map(layerId => {
          const layer = layers.find(l => l.id === layerId);
          if (!layer) return null;
          
          const transform = layer.transform || {};
          const x = dimensions.width / 2 + (transform.x || 0) * zoom;
          const y = dimensions.height / 2 + (transform.y || 0) * zoom;
          const w = (project.width * 0.3 * (transform.scaleX || 1)) * zoom;
          const h = (project.height * 0.3 * (transform.scaleY || 1)) * zoom;
          
          return (
            <div
              key={layerId}
              className="selection-box"
              style={{
                left: x - w / 2,
                top: y - h / 2,
                width: w,
                height: h,
                transform: `rotate(${(transform.rotation || 0)}deg)`
              }}
            >
              <div className="selection-handle top-left" />
              <div className="selection-handle top-right" />
              <div className="selection-handle bottom-left" />
              <div className="selection-handle bottom-right" />
            </div>
          );
        })}
      </div>
      
      {/* Canvas info */}
      <div className="canvas-info">
        {project.width} × {project.height} @ {project.frameRate}fps
      </div>
      
      <style>{`
        .canvas-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }
        
        .canvas-wrapper {
          position: relative;
          background: #000;
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
        }
        
        .canvas-wrapper canvas {
          display: block;
        }
        
        .selection-box {
          position: absolute;
          border: 2px solid var(--accent-primary);
          pointer-events: none;
        }
        
        .selection-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: var(--accent-primary);
          border: 2px solid white;
          border-radius: 2px;
        }
        
        .selection-handle.top-left {
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        }
        
        .selection-handle.top-right {
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        }
        
        .selection-handle.bottom-left {
          bottom: -5px;
          left: -5px;
          cursor: nesw-resize;
        }
        
        .selection-handle.bottom-right {
          bottom: -5px;
          right: -5px;
          cursor: nwse-resize;
        }
        
        .canvas-info {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
