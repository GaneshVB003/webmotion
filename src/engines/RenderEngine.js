// WebMotion Rendering Engine
// High-performance 2D rendering with WebGL acceleration

export class RenderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    this.glCanvas = null;
    this.gl = null;
    this.useWebGL = false;
    
    // Rendering settings
    this.pixelRatio = window.devicePixelRatio || 1;
    this.backgroundColor = '#000000';
    this.quality = 'high'; // 'low', 'medium', 'high'
    
    // Cache for performance
    this.layerCache = new Map();
    this.imageCache = new Map();
    
    // Animation frame
    this.rafId = null;
    this.isRendering = false;
    
    // Performance monitoring
    this.frameTime = 0;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fps = 60;
    
    this.init();
  }
  
  init() {
    // Try to initialize WebGL
    this.tryInitWebGL();
    
    // Set up canvas
    this.resize();
    
    // Handle resize
    window.addEventListener('resize', () => this.resize());
  }
  
  tryInitWebGL() {
    try {
      this.glCanvas = document.createElement('canvas');
      this.gl = this.glCanvas.getContext('webgl2', { 
        alpha: true, 
        premultipliedAlpha: false,
        antialias: true 
      });
      
      if (this.gl) {
        this.useWebGL = true;
        console.log('WebGL2 initialized successfully');
      }
    } catch (e) {
      console.warn('WebGL2 not available, using Canvas 2D:', e);
      this.useWebGL = false;
    }
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    if (this.ctx) {
      this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }
    
    if (this.glCanvas && this.gl) {
      this.glCanvas.width = this.canvas.width;
      this.glCanvas.height = this.canvas.height;
    }
  }
  
  // Clear the canvas
  clear(color = null) {
    const bgColor = color || this.backgroundColor;
    
    if (this.useWebGL && this.gl) {
      this.gl.clearColor(
        this.hexToRgb(bgColor).r / 255,
        this.hexToRgb(bgColor).g / 255,
        this.hexToRgb(bgColor).b / 255,
        1
      );
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    } else {
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }
  
  // Main render function
  render(layers, time, projectSettings) {
    const startTime = performance.now();
    
    // Clear canvas
    this.clear(projectSettings?.backgroundColor);
    
    // Get layers in render order (bottom to top)
    const sortedLayers = [...layers].reverse();
    
    // Render each visible layer
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;
      
      this.renderLayer(layer, time, projectSettings);
    }
    
    // Calculate FPS
    this.frameTime = performance.now() - startTime;
    this.frameCount++;
    
    if (performance.now() - this.lastFrameTime >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / (performance.now() - this.lastFrameTime));
      this.frameCount = 0;
      this.lastFrameTime = performance.now();
    }
  }
  
  // Render a single layer
  renderLayer(layer, time, projectSettings) {
    const ctx = this.ctx;
    
    // Get interpolated transform values
    const transform = this.getLayerTransform(layer, time);
    
    // Save context
    ctx.save();
    
    // Apply blend mode
    ctx.globalCompositeOperation = this.getBlendMode(layer.blendMode);
    
    // Apply opacity
    ctx.globalAlpha = layer.opacity;
    
    // Apply transform
    ctx.translate(
      this.width * transform.anchorX + transform.x,
      this.height * transform.anchorY + transform.y
    );
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.scaleX, transform.scaleY);
    
    // Render based on layer type
    switch (layer.type) {
      case 'solid':
        this.renderSolid(layer, ctx, projectSettings);
        break;
      case 'shape':
        this.renderShape(layer, ctx, projectSettings);
        break;
      case 'text':
        this.renderText(layer, ctx, projectSettings);
        break;
      case 'image':
        this.renderImage(layer, ctx, projectSettings);
        break;
      case 'video':
        this.renderVideo(layer, ctx, projectSettings);
        break;
      case 'group':
        this.renderGroup(layer, time, ctx, projectSettings);
        break;
    }
    
    // Restore context
    ctx.restore();
  }
  
  // Get interpolated transform values
  getLayerTransform(layer, time) {
    const baseTransform = layer.transform || {
      x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5
    };
    
    const result = { ...baseTransform };
    
    // Interpolate keyframes for each property
    ['x', 'y', 'scaleX', 'scaleY', 'rotation', 'anchorX', 'anchorY'].forEach(prop => {
      if (layer.keyframes?.[prop]?.length > 0) {
        result[prop] = this.interpolateKeyframes(layer.keyframes[prop], time, baseTransform[prop]);
      }
    });
    
    return result;
  }
  
  // Interpolate keyframes
  interpolateKeyframes(keyframes, time, defaultValue) {
    if (!keyframes || keyframes.length === 0) return defaultValue;
    
    // Sort by time
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    
    // Before first keyframe
    if (time <= sorted[0].time) return sorted[0].value;
    
    // After last keyframe
    if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;
    
    // Between keyframes
    for (let i = 0; i < sorted.length - 1; i++) {
      if (time >= sorted[i].time && time <= sorted[i + 1].time) {
        const k1 = sorted[i];
        const k2 = sorted[i + 1];
        const t = (time - k1.time) / (k2.time - k1.time);
        const easedT = this.applyEasing(t, k1.easing);
        
        if (typeof k1.value === 'object' && k1.value !== null) {
          // Interpolate color or object
          return this.interpolateValue(k1.value, k2.value, easedT);
        }
        
        return k1.value + (k2.value - k1.value) * easedT;
      }
    }
    
    return defaultValue;
  }
  
  // Apply easing function
  applyEasing(t, easing) {
    switch (easing) {
      case 'ease-in': return t * t;
      case 'ease-out': return 1 - (1 - t) * (1 - t);
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'linear': default: return t;
    }
  }
  
  // Interpolate between two values
  interpolateValue(v1, v2, t) {
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      return v1 + (v2 - v1) * t;
    }
    if (typeof v1 === 'string' && v1.startsWith('#')) {
      const c1 = this.hexToRgb(v1);
      const c2 = this.hexToRgb(v2);
      return this.rgbToHex(
        Math.round(c1.r + (c2.r - c1.r) * t),
        Math.round(c1.g + (c2.g - c1.g) * t),
        Math.round(c1.b + (c2.b - c1.b) * t)
      );
    }
    return v2;
  }
  
  // Render solid color layer
  renderSolid(layer, ctx, projectSettings) {
    const w = projectSettings?.width || 1920;
    const h = projectSettings?.height || 1080;
    
    ctx.fillStyle = layer.color || '#6366f1';
    ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
  }
  
  // Render shape layer
  renderShape(layer, ctx, projectSettings) {
    const w = projectSettings?.width || 1920;
    const h = projectSettings?.height || 1080;
    const size = Math.min(w, h) * 0.3;
    
    ctx.beginPath();
    
    switch (layer.shapeType) {
      case 'rectangle':
        const r = layer.cornerRadius || 0;
        if (r > 0) {
          this.roundRect(ctx, -size/2, -size/2, size, size, r);
        } else {
          ctx.rect(-size/2, -size/2, size, size);
        }
        break;
        
      case 'circle':
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        break;
        
      case 'ellipse':
        ctx.ellipse(0, 0, size/2, size/3, 0, 0, Math.PI * 2);
        break;
        
      case 'polygon':
        const sides = layer.sides || 6;
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * size / 2;
          const y = Math.sin(angle) * size / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
        
      case 'star':
        const points = layer.points || 5;
        const innerRadius = size / 4;
        const outerRadius = size / 2;
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
        
      default:
        ctx.rect(-size/2, -size/2, size, size);
    }
    
    // Fill
    if (layer.fill && layer.fill !== 'none') {
      ctx.fillStyle = layer.fill;
      ctx.fill();
    }
    
    // Stroke
    if (layer.strokeWidth > 0 && layer.stroke !== 'none') {
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = layer.strokeWidth;
      ctx.stroke();
    }
  }
  
  // Render text layer
  renderText(layer, ctx, projectSettings) {
    const fontSize = layer.fontSize || 48;
    const fontFamily = layer.fontFamily || 'Inter';
    const fontWeight = layer.fontWeight || 400;
    const color = layer.color || '#ffffff';
    const text = layer.text || 'Text';
    
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = layer.textAlign || 'left';
    ctx.textBaseline = 'top';
    
    const lines = text.split('\n');
    const lineHeight = (layer.lineHeight || 1.2) * fontSize;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, -this.width/2, -this.height/2 + index * lineHeight);
    });
  }
  
  // Render image layer
  renderImage(layer, ctx, projectSettings) {
    if (!layer.src) {
      // Render placeholder
      ctx.fillStyle = '#333';
      ctx.fillRect(-100, -75, 200, 150);
      ctx.fillStyle = '#666';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No Image', 0, 5);
      return;
    }
    
    // Check cache
    const img = this.imageCache.get(layer.src);
    if (img) {
      const w = projectSettings?.width || 1920;
      const h = projectSettings?.height || 1080;
      const aspect = img.width / img.height;
      let dw = w * 0.4;
      let dh = dw / aspect;
      if (dh > h * 0.4) {
        dh = h * 0.4;
        dw = dh * aspect;
      }
      ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
    }
  }
  
  // Render video layer
  renderVideo(layer, ctx, projectSettings) {
    if (!layer.videoElement) {
      // Render placeholder
      ctx.fillStyle = '#222';
      ctx.fillRect(-160, -90, 320, 180);
      ctx.fillStyle = '#555';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No Video', 0, 5);
      return;
    }
    
    const w = projectSettings?.width || 1920;
    const h = projectSettings?.height || 1080;
    const aspect = layer.videoElement.videoWidth / layer.videoElement.videoHeight;
    let dw = w * 0.6;
    let dh = dw / aspect;
    if (dh > h * 0.6) {
      dh = h * 0.6;
      dw = dh * aspect;
    }
    ctx.drawImage(layer.videoElement, -dw/2, -dh/2, dw, dh);
  }
  
  // Render group layer
  renderGroup(layer, time, ctx, projectSettings) {
    // Render children
    const children = layer.children || [];
    children.forEach(childId => {
      const child = this.layerCache.get(childId);
      if (child && child.visible) {
        this.renderLayer(child, time, projectSettings);
      }
    });
  }
  
  // Utility functions
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
  
  getBlendMode(mode) {
    const modes = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'darken': 'darken',
      'lighten': 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      'difference': 'difference',
      'exclusion': 'exclusion'
    };
    return modes[mode] || 'source-over';
  }
  
  roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  
  // Cache management
  cacheLayer(layer) {
    this.layerCache.set(layer.id, layer);
  }
  
  clearCache() {
    this.layerCache.clear();
  }
  
  // Load image into cache
  loadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        resolve(this.imageCache.get(src));
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
  
  // Get performance stats
  getStats() {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2),
      width: this.width,
      height: this.height,
      pixelRatio: this.pixelRatio,
      useWebGL: this.useWebGL
    };
  }
  
  // Set quality
  setQuality(quality) {
    this.quality = quality;
    switch (quality) {
      case 'low':
        this.pixelRatio = 0.5;
        break;
      case 'medium':
        this.pixelRatio = 0.75;
        break;
      case 'high':
      default:
        this.pixelRatio = window.devicePixelRatio || 1;
    }
    this.resize();
  }
  
  // Destroy
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('resize', this.resize);
  }
}

export default RenderEngine;
