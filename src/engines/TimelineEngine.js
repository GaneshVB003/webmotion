// WebMotion Timeline Engine
// Handles timeline rendering, playback, and interactions

export class TimelineEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Settings
    this.options = {
      height: 200,
      trackHeight: 32,
      rulerHeight: 30,
      minZoom: 0.1,
      maxZoom: 10,
      defaultZoom: 1,
      snapEnabled: true,
      snapThreshold: 5,
      ...options
    };
    
    // State
    this.zoom = this.options.defaultZoom;
    this.scrollX = 0;
    this.scrollY = 0;
    this.duration = 30;
    this.frameRate = 30;
    this.currentTime = 0;
    this.isPlaying = false;
    this.isLooping = true;
    
    // Selection
    this.selectedLayerIds = [];
    this.selectedKeyframes = [];
    this.dragging = null;
    this.hoveredTrack = null;
    this.hoveredKeyframe = null;
    
    // Visual settings
    this.colors = {
      background: '#0f0f0f',
      ruler: '#1a1a1a',
      rulerText: '#888888',
      playhead: '#ef4444',
      playheadHead: '#ff6666',
      track: '#141414',
      trackHover: '#1e1e1e',
      trackSelected: '#252525',
      keyframe: '#6366f1',
      keyframeSelected: '#818cf8',
      selection: 'rgba(99, 102, 241, 0.2)',
      marker: '#f59e0b',
      snapLine: '#22c55e',
      text: '#e0e0e0',
      textMuted: '#666666'
    };
    
    // Event callbacks
    this.onTimeChange = null;
    this.onLayerSelect = null;
    this.onKeyframeSelect = null;
    this.onDragStart = null;
    this.onDragMove = null;
    this.onDragEnd = null;
    
    // Bind events
    this.bindEvents();
    
    // Initial render
    this.resize();
  }
  
  bindEvents() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Context menu
    this.canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    // Resize
    window.addEventListener('resize', this.resize.bind(this));
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = this.options.height;
    
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.render();
  }
  
  // Convert time to x position
  timeToX(time) {
    const pixelsPerSecond = 100 * this.zoom;
    return time * pixelsPerSecond - this.scrollX;
  }
  
  // Convert x position to time
  xToTime(x) {
    const pixelsPerSecond = 100 * this.zoom;
    return (x + this.scrollX) / pixelsPerSecond;
  }
  
  // Convert y position to track index
  yToTrackIndex(y) {
    const trackY = y - this.options.rulerHeight - this.scrollY;
    return Math.floor(trackY / this.options.trackHeight);
  }
  
  // Render the timeline
  render() {
    const ctx = this.ctx;
    
    // Clear
    ctx.fillStyle = this.colors.background;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw ruler
    this.drawRuler();
    
    // Draw tracks
    this.drawTracks();
    
    // Draw playhead
    this.drawPlayhead();
    
    // Draw markers
    this.drawMarkers();
    
    // Draw selection
    if (this.dragging?.type === 'selection') {
      this.drawSelection();
    }
  }
  
  drawRuler() {
    const ctx = this.ctx;
    const { rulerHeight, ruler, rulerText } = this.colors;
    
    // Background
    ctx.fillStyle = ruler;
    ctx.fillRect(0, 0, this.width, rulerHeight);
    
    // Time markers
    const pixelsPerSecond = 100 * this.zoom;
    const minInterval = 10 / pixelsPerSecond; // Minimum 10 pixels between markers
    const interval = this.getRulerInterval(minInterval);
    
    ctx.fillStyle = rulerText;
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    
    const startTime = this.xToTime(0);
    const endTime = this.xToTime(this.width);
    const startTick = Math.floor(startTime / interval) * interval;
    
    for (let time = startTick; time <= endTime; time += interval) {
      const x = this.timeToX(time);
      const isMajor = time % (interval * 5) === 0;
      
      // Tick
      ctx.strokeStyle = rulerText;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, rulerHeight - (isMajor ? 12 : 6));
      ctx.lineTo(x, rulerHeight);
      ctx.stroke();
      
      // Label for major ticks
      if (isMajor) {
        const label = this.formatTime(time);
        ctx.fillText(label, x, rulerHeight - 16);
      }
    }
  }
  
  getRulerInterval(minInterval) {
    const intervals = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 30, 60];
    return intervals.find(i => i >= minInterval) || 1;
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * this.frameRate);
    
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }
    return `${secs}:${frames.toString().padStart(2, '0')}`;
  }
  
  drawTracks() {
    const ctx = this.ctx;
    const { track, trackHover, trackSelected, text, textMuted } = this.colors;
    
    const trackY = this.options.rulerHeight - this.scrollY;
    
    // Draw tracks for each layer
    this.layers?.forEach((layer, index) => {
      const y = trackY + index * this.options.trackHeight;
      const isSelected = this.selectedLayerIds.includes(layer.id);
      const isHovered = this.hoveredTrack === layer.id;
      
      // Track background
      ctx.fillStyle = isSelected ? trackSelected : isHovered ? trackHover : track;
      ctx.fillRect(0, y, this.width, this.options.trackHeight - 1);
      
      // Track border
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + this.options.trackHeight - 1);
      ctx.lineTo(this.width, y + this.options.trackHeight - 1);
      ctx.stroke();
      
      // Layer name
      ctx.fillStyle = layer.locked ? textMuted : text;
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(layer.name, 8, y + this.options.trackHeight / 2 + 4);
      
      // Layer type icon
      ctx.fillStyle = layer.color || '#6366f1';
      ctx.beginPath();
      ctx.arc(120, y + this.options.trackHeight / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Visibility icon
      if (!layer.visible) {
        ctx.fillStyle = textMuted;
        ctx.fillText('👁', 140, y + this.options.trackHeight / 2 + 4);
      }
      
      // Draw keyframes for this layer
      this.drawLayerKeyframes(layer, y);
    });
  }
  
  drawLayerKeyframes(layer, trackY) {
    if (!layer.keyframes) return;
    
    const ctx = this.ctx;
    const centerY = trackY + this.options.trackHeight / 2;
    
    Object.entries(layer.keyframes).forEach(([property, keyframes]) => {
      keyframes.forEach(keyframe => {
        const x = this.timeToX(keyframe.time);
        
        if (x >= 0 && x <= this.width) {
          const isSelected = this.selectedKeyframes.some(
            k => k.layerId === layer.id && k.property === property && k.id === keyframe.id
          );
          
          ctx.fillStyle = isSelected ? this.colors.keyframeSelected : this.colors.keyframe;
          ctx.beginPath();
          
          // Diamond shape for keyframes
          ctx.moveTo(x, centerY - 6);
          ctx.lineTo(x + 5, centerY);
          ctx.lineTo(x, centerY + 6);
          ctx.lineTo(x - 5, centerY);
          ctx.closePath();
          
          ctx.fill();
        }
      });
    });
  }
  
  drawPlayhead() {
    const ctx = this.ctx;
    const x = this.timeToX(this.currentTime);
    
    // Playhead line
    ctx.strokeStyle = this.colors.playhead;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, this.height);
    ctx.stroke();
    
    // Playhead head (on ruler)
    ctx.fillStyle = this.colors.playheadHead;
    ctx.beginPath();
    ctx.moveTo(x - 6, this.options.rulerHeight - 1);
    ctx.lineTo(x + 6, this.options.rulerHeight - 1);
    ctx.lineTo(x, this.options.rulerHeight + 8);
    ctx.closePath();
    ctx.fill();
  }
  
  drawMarkers() {
    const ctx = this.ctx;
    
    this.markers?.forEach(marker => {
      const x = this.timeToX(marker.time);
      
      if (x >= 0 && x <= this.width) {
        ctx.fillStyle = this.colors.marker;
        ctx.fillRect(x, 0, 2, this.options.rulerHeight - 1);
        
        if (marker.label) {
          ctx.fillStyle = this.colors.marker;
          ctx.font = '9px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(marker.label, x, 10);
        }
      }
    });
  }
  
  drawSelection() {
    const ctx = this.ctx;
    const { startX, startY, currentX, currentY } = this.dragging;
    
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);
    
    ctx.fillStyle = this.colors.selection;
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = this.colors.keyframe;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
  
  // Event handlers
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on ruler (for playhead)
    if (y < this.options.rulerHeight) {
      this.dragging = { type: 'playhead', startX: x };
      this.setCurrentTimeFromX(x);
      return;
    }
    
    // Check if clicking on a keyframe
    const keyframeHit = this.hitTestKeyframe(x, y);
    if (keyframeHit) {
      this.dragging = { type: 'keyframe', ...keyframeHit, startX: x, startY: y };
      this.selectKeyframe(keyframeHit, e.shiftKey);
      return;
    }
    
    // Check if clicking on a track
    const trackIndex = this.yToTrackIndex(y);
    if (trackIndex >= 0 && trackIndex < (this.layers?.length || 0)) {
      const layer = this.layers[trackIndex];
      this.selectLayer(layer.id, !e.shiftKey);
      this.dragging = { type: 'track', layerId: layer.id, startY: y };
      return;
    }
    
    // Start selection box
    this.dragging = { type: 'selection', startX: x, startY: y, currentX: x, currentY: y };
    this.onDragStart?.({ type: 'selection', x, y });
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.dragging) {
      switch (this.dragging.type) {
        case 'playhead':
          this.setCurrentTimeFromX(x);
          break;
        case 'keyframe':
          this.handleKeyframeDrag(x, y);
          break;
        case 'selection':
          this.dragging.currentX = x;
          this.dragging.currentY = y;
          break;
      }
      this.onDragMove?.(this.dragging);
    } else {
      // Update hover state
      this.hoveredTrack = this.yToTrackIndex(y) >= 0 ? 
        this.layers?.[this.yToTrackIndex(y)]?.id : null;
      this.hoveredKeyframe = this.hitTestKeyframe(x, y);
    }
    
    this.render();
  }
  
  handleMouseUp(e) {
    if (this.dragging?.type === 'selection') {
      // Process selection
      const { startX, startY, currentX, currentY } = this.dragging;
      this.selectLayersInRect(
        Math.min(startX, currentX),
        Math.min(startY, currentY),
        Math.abs(currentX - startX),
        Math.abs(currentY - startY)
      );
    }
    
    this.onDragEnd?.(this.dragging);
    this.dragging = null;
    this.render();
  }
  
  handleMouseLeave() {
    this.hoveredTrack = null;
    this.hoveredKeyframe = null;
    this.render();
  }
  
  handleWheel(e) {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.setZoom(this.zoom * delta);
    } else {
      // Scroll
      this.scrollX = Math.max(0, this.scrollX + e.deltaX + e.deltaY);
    }
    
    this.render();
  }
  
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.dragging = { type: 'playhead', startX: x };
    this.setCurrentTimeFromX(x);
  }
  
  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    
    this.setCurrentTimeFromX(x);
  }
  
  handleTouchEnd() {
    this.dragging = null;
  }
  
  handleContextMenu(e) {
    e.preventDefault();
    // Context menu will be handled by parent
  }
  
  // Hit testing
  hitTestKeyframe(x, y) {
    const threshold = 8;
    
    for (const layer of this.layers || []) {
      if (!layer.keyframes) continue;
      
      for (const [property, keyframes] of Object.entries(layer.keyframes)) {
        for (const keyframe of keyframes) {
          const kx = this.timeToX(keyframe.time);
          const trackIndex = this.layers.indexOf(layer);
          const ky = this.options.rulerHeight + trackIndex * this.options.trackHeight + this.options.trackHeight / 2;
          
          if (Math.abs(x - kx) < threshold && Math.abs(y - ky) < threshold) {
            return { layerId: layer.id, property, id: keyframe.id, x: kx, y: ky };
          }
        }
      }
    }
    
    return null;
  }
  
  // Selection
  selectLayer(layerId, exclusive = true) {
    if (exclusive) {
      this.selectedLayerIds = [layerId];
    } else {
      if (this.selectedLayerIds.includes(layerId)) {
        this.selectedLayerIds = this.selectedLayerIds.filter(id => id !== layerId);
      } else {
        this.selectedLayerIds.push(layerId);
      }
    }
    this.onLayerSelect?.(this.selectedLayerIds);
    this.render();
  }
  
  selectKeyframe(keyframeHit, addToSelection = false) {
    const keyframe = { ...keyframeHit };
    
    if (addToSelection) {
      const existing = this.selectedKeyframes.findIndex(
        k => k.layerId === keyframe.layerId && k.property === keyframe.property && k.id === keyframe.id
      );
      if (existing >= 0) {
        this.selectedKeyframes.splice(existing, 1);
      } else {
        this.selectedKeyframes.push(keyframe);
      }
    } else {
      this.selectedKeyframes = [keyframe];
    }
    
    this.onKeyframeSelect?.(this.selectedKeyframes);
    this.render();
  }
  
  selectLayersInRect(x, y, w, h) {
    const selected = [];
    
    this.layers?.forEach((layer, index) => {
      const trackY = this.options.rulerHeight + index * this.options.trackHeight;
      const trackH = this.options.trackHeight;
      
      if (x < this.width && y < trackY + trackH && x + w > 0 && y + h > trackY) {
        selected.push(layer.id);
      }
    });
    
    this.selectedLayerIds = selected;
    this.onLayerSelect?.(this.selectedLayerIds);
  }
  
  // Time operations
  setCurrentTimeFromX(x) {
    const time = Math.max(0, Math.min(this.xToTime(x), this.duration));
    this.currentTime = time;
    this.onTimeChange?.(time);
    this.render();
  }
  
  setCurrentTime(time) {
    this.currentTime = Math.max(0, Math.min(time, this.duration));
    this.render();
  }
  
  // Zoom
  setZoom(zoom) {
    this.zoom = Math.max(this.options.minZoom, Math.min(zoom, this.options.maxZoom));
    this.render();
  }
  
  // Scroll
  setScrollX(scrollX) {
    this.scrollX = Math.max(0, scrollX);
    this.render();
  }
  
  // Update data
  setLayers(layers) {
    this.layers = layers;
    this.render();
  }
  
  setMarkers(markers) {
    this.markers = markers;
    this.render();
  }
  
  // Playback
  play() {
    this.isPlaying = true;
    this.playInternal();
  }
  
  playInternal() {
    if (!this.isPlaying) return;
    
    const now = performance.now();
    const delta = (now - (this.lastPlayTime || now)) / 1000;
    this.lastPlayTime = now;
    
    this.currentTime += delta;
    
    if (this.currentTime >= this.duration) {
      if (this.isLooping) {
        this.currentTime = 0;
      } else {
        this.currentTime = this.duration;
        this.isPlaying = false;
        return;
      }
    }
    
    this.onTimeChange?.(this.currentTime);
    this.render();
    
    requestAnimationFrame(() => this.playInternal());
  }
  
  pause() {
    this.isPlaying = false;
    this.lastPlayTime = null;
  }
  
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  
  // Destroy
  destroy() {
    this.pause();
    this.canvas.remove();
  }
}

export default TimelineEngine;
