import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create immer-like mutations
const produce = (state, callback) => {
  const newState = JSON.parse(JSON.stringify(state));
  callback(newState);
  return newState;
};

// Default project settings
const DEFAULT_PROJECT = {
  id: uuidv4(),
  name: 'Untitled Project',
  width: 1920,
  height: 1080,
  frameRate: 30,
  duration: 30,
  aspectRatio: '16:9',
  backgroundColor: '#000000',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Create a new layer
export const createLayer = (type, options = {}) => {
  const defaults = {
    id: uuidv4(),
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
    type,
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'normal',
    color: '#6366f1',
    parentId: null,
    ...options
  };

  switch (type) {
    case 'text':
      return {
        ...defaults,
        text: 'Text Layer',
        fontFamily: 'Inter',
        fontSize: 48,
        fontWeight: 400,
        color: '#ffffff',
        textAlign: 'left',
        letterSpacing: 0,
        lineHeight: 1.2,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
        keyframes: {}
      };
    case 'shape':
      return {
        ...defaults,
        shapeType: 'rectangle',
        fill: '#6366f1',
        stroke: '#ffffff',
        strokeWidth: 0,
        cornerRadius: 0,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
        keyframes: {}
      };
    case 'image':
      return {
        ...defaults,
        src: null,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
        keyframes: {}
      };
    case 'video':
      return {
        ...defaults,
        src: null,
        volume: 1,
        muted: false,
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
        keyframes: {}
      };
    case 'audio':
      return {
        ...defaults,
        src: null,
        volume: 1,
        muted: false,
        keyframes: {}
      };
    case 'group':
      return {
        ...defaults,
        children: [],
        keyframes: {}
      };
    case 'solid':
      return {
        ...defaults,
        color: '#6366f1',
        transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
        keyframes: {}
      };
    default:
      return { ...defaults, transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 }, keyframes: {} };
  }
};

// Create a keyframe
export const createKeyframe = (time, value, easing = 'linear') => ({
  id: uuidv4(),
  time,
  value,
  easing,
  selected: false
});

export const useProjectStore = create(
  immer((set, get) => ({
    // Project settings
    project: DEFAULT_PROJECT,
    
    // Timeline state
    currentTime: 0,
    duration: 30,
    frameRate: 30,
    isPlaying: false,
    isLooping: true,
    zoom: 1,
    scrollX: 0,
    selectedLayerIds: [],
    selectedKeyframeIds: [],
    activeTool: 'select',
    
    // Layers
    layers: [],
    layerOrder: [],
    
    // Undo/Redo stacks
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    
    // UI State
    theme: 'dark',
    workspacePreset: 'default',
    showLeftPanel: true,
    showRightPanel: true,
    showTimeline: true,
    leftPanelWidth: 280,
    rightPanelWidth: 300,
    timelineHeight: 200,
    
    // Assets
    assets: [],
    
    // Markers
    markers: [],
    
    // Selection box for multi-select
    selectionBox: null,
    
    // Project actions
    setProject: (project) => set((state) => {
      state.project = { ...state.project, ...project };
    }),
    
    newProject: () => set((state) => {
      state.project = { ...DEFAULT_PROJECT, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      state.layers = [];
      state.layerOrder = [];
      state.currentTime = 0;
      state.history = [];
      state.historyIndex = -1;
      state.markers = [];
      state.assets = [];
    }),
    
    // Timeline actions
    setCurrentTime: (time) => set((state) => {
      state.currentTime = Math.max(0, Math.min(time, state.duration));
    }),
    
    setDuration: (duration) => set((state) => {
      state.duration = duration;
      state.project.duration = duration;
    }),
    
    setFrameRate: (frameRate) => set((state) => {
      state.frameRate = frameRate;
      state.project.frameRate = frameRate;
    }),
    
    play: () => set((state) => { state.isPlaying = true; }),
    pause: () => set((state) => { state.isPlaying = false; }),
    togglePlay: () => set((state) => { state.isPlaying = !state.isPlaying; }),
    
    toggleLoop: () => set((state) => { state.isLooping = !state.isLooping; }),
    
    setZoom: (zoom) => set((state) => {
      state.zoom = Math.max(0.1, Math.min(zoom, 10));
    }),
    
    setScrollX: (scrollX) => set((state) => {
      state.scrollX = Math.max(0, scrollX);
    }),
    
    stepForward: () => set((state) => {
      const frameTime = 1 / state.frameRate;
      state.currentTime = Math.min(state.currentTime + frameTime, state.duration);
    }),
    
    stepBackward: () => set((state) => {
      const frameTime = 1 / state.frameRate;
      state.currentTime = Math.max(state.currentTime - frameTime, 0);
    }),
    
    goToStart: () => set((state) => { state.currentTime = 0; }),
    goToEnd: () => set((state) => { state.currentTime = state.duration; }),
    
    // Layer actions
    addLayer: (type, options = {}) => set((state) => {
      const layer = createLayer(type, options);
      state.layers.push(layer);
      state.layerOrder.push(layer.id);
      state.selectedLayerIds = [layer.id];
      get().saveToHistory('Add Layer');
    }),
    
    removeLayer: (layerId) => set((state) => {
      state.layers = state.layers.filter(l => l.id !== layerId);
      state.layerOrder = state.layerOrder.filter(id => id !== layerId);
      state.selectedLayerIds = state.selectedLayerIds.filter(id => id !== layerId);
      get().saveToHistory('Remove Layer');
    }),
    
    updateLayer: (layerId, updates) => set((state) => {
      const index = state.layers.findIndex(l => l.id === layerId);
      if (index !== -1) {
        state.layers[index] = { ...state.layers[index], ...updates };
      }
    }),
    
    setLayerProperty: (layerId, property, value) => set((state) => {
      const index = state.layers.findIndex(l => l.id === layerId);
      if (index !== -1) {
        state.layers[index][property] = value;
      }
    }),
    
    setLayerTransform: (layerId, transform) => set((state) => {
      const index = state.layers.findIndex(l => l.id === layerId);
      if (index !== -1) {
        state.layers[index].transform = { ...state.layers[index].transform, ...transform };
      }
    }),
    
    reorderLayer: (fromIndex, toIndex) => set((state) => {
      const [removed] = state.layerOrder.splice(fromIndex, 1);
      state.layerOrder.splice(toIndex, 0, removed);
    }),
    
    duplicateLayer: (layerId) => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer) {
        const newLayer = {
          ...JSON.parse(JSON.stringify(layer)),
          id: uuidv4(),
          name: `${layer.name} Copy`
        };
        const index = state.layers.findIndex(l => l.id === layerId);
        state.layers.splice(index + 1, 0, newLayer);
        state.layerOrder.splice(index + 1, 0, newLayer.id);
        state.selectedLayerIds = [newLayer.id];
        get().saveToHistory('Duplicate Layer');
      }
    }),
    
    toggleLayerVisibility: (layerId) => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer) {
        layer.visible = !layer.visible;
      }
    }),
    
    toggleLayerLock: (layerId) => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer) {
        layer.locked = !layer.locked;
      }
    }),
    
    setLayerColor: (layerId, color) => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer) {
        layer.color = color;
      }
    }),
    
    setLayerParent: (layerId, parentId) => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer) {
        layer.parentId = parentId;
      }
    }),
    
    // Selection
    selectLayer: (layerId, addToSelection = false) => set((state) => {
      if (addToSelection) {
        if (state.selectedLayerIds.includes(layerId)) {
          state.selectedLayerIds = state.selectedLayerIds.filter(id => id !== layerId);
        } else {
          state.selectedLayerIds.push(layerId);
        }
      } else {
        state.selectedLayerIds = layerId ? [layerId] : [];
      }
    }),
    
    selectAllLayers: () => set((state) => {
      state.selectedLayerIds = state.layers.map(l => l.id);
    }),
    
    deselectAllLayers: () => set((state) => {
      state.selectedLayerIds = [];
      state.selectedKeyframeIds = [];
    }),
    
    // Keyframe actions
    addKeyframe: (layerId, property, time, value, easing = 'linear') => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer) {
        if (!layer.keyframes[property]) {
          layer.keyframes[property] = [];
        }
        const keyframe = createKeyframe(time, value, easing);
        layer.keyframes[property].push(keyframe);
        layer.keyframes[property].sort((a, b) => a.time - b.time);
      }
    }),
    
    removeKeyframe: (layerId, property, keyframeId) => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer && layer.keyframes[property]) {
        layer.keyframes[property] = layer.keyframes[property].filter(k => k.id !== keyframeId);
      }
    }),
    
    updateKeyframe: (layerId, property, keyframeId, updates) => set((state) => {
      const layer = state.layers.find(l => l.id === layerId);
      if (layer && layer.keyframes[property]) {
        const index = layer.keyframes[property].findIndex(k => k.id === keyframeId);
        if (index !== -1) {
          layer.keyframes[property][index] = { ...layer.keyframes[property][index], ...updates };
        }
      }
    }),
    
    getKeyframeValue: (layer, property, time) => {
      if (!layer.keyframes[property] || layer.keyframes[property].length === 0) {
        return layer.transform?.[property] ?? layer[property] ?? 0;
      }
      
      const keyframes = layer.keyframes[property];
      
      // Before first keyframe
      if (time <= keyframes[0].time) {
        return keyframes[0].value;
      }
      
      // After last keyframe
      if (time >= keyframes[keyframes.length - 1].time) {
        return keyframes[keyframes.length - 1].value;
      }
      
      // Between keyframes - interpolate
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
          const k1 = keyframes[i];
          const k2 = keyframes[i + 1];
          const t = (time - k1.time) / (k2.time - k1.time);
          
          // Apply easing
          const easedT = applyEasing(t, k1.easing);
          
          return k1.value + (k2.value - k1.value) * easedT;
        }
      }
      
      return keyframes[0].value;
    },
    
    // Markers
    addMarker: (time, label = '') => set((state) => {
      state.markers.push({ id: uuidv4(), time, label });
      state.markers.sort((a, b) => a.time - b.time);
    }),
    
    removeMarker: (markerId) => set((state) => {
      state.markers = state.markers.filter(m => m.id !== markerId);
    }),
    
    // Assets
    addAsset: (asset) => set((state) => {
      state.assets.push({ id: uuidv4(), ...asset, addedAt: new Date().toISOString() });
    }),
    
    removeAsset: (assetId) => set((state) => {
      state.assets = state.assets.filter(a => a.id !== assetId);
    }),
    
    // UI actions
    setTheme: (theme) => set((state) => {
      state.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
    }),
    
    toggleTheme: () => set((state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
    }),
    
    setActiveTool: (tool) => set((state) => {
      state.activeTool = tool;
    }),
    
    setLeftPanelWidth: (width) => set((state) => {
      state.leftPanelWidth = Math.max(200, Math.min(width, 500));
    }),
    
    setRightPanelWidth: (width) => set((state) => {
      state.rightPanelWidth = Math.max(200, Math.min(width, 500));
    }),
    
    setTimelineHeight: (height) => set((state) => {
      state.timelineHeight = Math.max(100, Math.min(height, 500));
    }),
    
    toggleLeftPanel: () => set((state) => {
      state.showLeftPanel = !state.showLeftPanel;
    }),
    
    toggleRightPanel: () => set((state) => {
      state.showRightPanel = !state.showRightPanel;
    }),
    
    toggleTimeline: () => set((state) => {
      state.showTimeline = !state.showTimeline;
    }),
    
    setWorkspacePreset: (preset) => set((state) => {
      state.workspacePreset = preset;
    }),
    
    // Selection box
    setSelectionBox: (box) => set((state) => {
      state.selectionBox = box;
    }),
    
    // History - Undo/Redo
    saveToHistory: (action = 'Action') => set((state) => {
      // Remove any future states if we're not at the end
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      
      // Save current state
      const snapshot = {
        action,
        timestamp: Date.now(),
        layers: JSON.parse(JSON.stringify(state.layers)),
        layerOrder: [...state.layerOrder],
        duration: state.duration,
        frameRate: state.frameRate
      };
      
      state.history.push(snapshot);
      
      // Limit history size
      if (state.history.length > state.maxHistory) {
        state.history.shift();
      } else {
        state.historyIndex++;
      }
    }),
    
    undo: () => set((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const snapshot = state.history[state.historyIndex];
        state.layers = JSON.parse(JSON.stringify(snapshot.layers));
        state.layerOrder = [...snapshot.layerOrder];
        state.duration = snapshot.duration;
        state.frameRate = snapshot.frameRate;
      }
    }),
    
    redo: () => set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const snapshot = state.history[state.historyIndex];
        state.layers = JSON.parse(JSON.stringify(snapshot.layers));
        state.layerOrder = [...snapshot.layerOrder];
        state.duration = snapshot.duration;
        state.frameRate = snapshot.frameRate;
      }
    }),
    
    canUndo: () => {
      const state = get();
      return state.historyIndex > 0;
    },
    
    canRedo: () => {
      const state = get();
      return state.historyIndex < state.history.length - 1;
    },
    
    // Export project as JSON
    exportProject: () => {
      const state = get();
      return {
        project: state.project,
        layers: state.layers,
        layerOrder: state.layerOrder,
        markers: state.markers,
        assets: state.assets,
        version: '1.0'
      };
    },
    
    // Import project from JSON
    importProject: (data) => set((state) => {
      if (data.project) state.project = data.project;
      if (data.layers) state.layers = data.layers;
      if (data.layerOrder) state.layerOrder = data.layerOrder;
      if (data.markers) state.markers = data.markers;
      if (data.assets) state.assets = data.assets;
      state.duration = state.project.duration;
      state.frameRate = state.project.frameRate;
      state.history = [];
      state.historyIndex = -1;
    })
  }))
);

// Easing functions
function applyEasing(t, easing) {
  switch (easing) {
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return 1 - (1 - t) * (1 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'ease-in-bounce':
      return 1 - bounceOut(1 - t);
    case 'ease-out-bounce':
      return bounceOut(t);
    case 'ease-in-elastic':
      return elasticIn(t);
    case 'ease-out-elastic':
      return elasticOut(t);
    default:
      return t;
  }
}

function bounceOut(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

function elasticIn(t) {
  if (t === 0 || t === 1) return t;
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
}

function elasticOut(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}
