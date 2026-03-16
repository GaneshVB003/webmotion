import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export interface Keyframe {
  id: string
  time: number
  value: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface Transform {
  positionX: number
  positionY: number
  positionZ: number
  scaleX: number
  scaleY: number
  rotationZ: number
}

export interface MediaAsset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio'
  src: string
  duration?: number
}

export interface Clip {
  id: string
  assetId: string
  startTime: number
  duration: number
  inPoint: number
  outPoint: number
  transform: Transform
  keyframes: Record<string, Keyframe[]>
  opacity: number
  volume: number
}

export interface Transition {
  id: string
  type: 'slide' | 'zoom' | 'tilt' | 'blur' | 'parallax' | 'fade'
  clipAId: string
  clipBId: string
  duration: number
  params: Record<string, number>
}

export interface Project {
  id: string
  name: string
  width: number
  height: number
  frameRate: number
  duration: number
}

const DEFAULT_TRANSFORM: Transform = {
  positionX: 0, positionY: 0, positionZ: 0,
  scaleX: 1, scaleY: 1, rotationZ: 0
}

interface EditorState {
  project: Project
  currentTime: number
  isPlaying: boolean
  zoom: number
  selectedClipIds: string[]
  assets: MediaAsset[]
  clips: Clip[]
  transitions: Transition[]
  history: { clips: Clip[]; transitions: Transition[] }[]
  historyIndex: number
}

interface EditorActions {
  setCurrentTime: (t: number) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setZoom: (z: number) => void
  selectClip: (id: string, add?: boolean) => void
  addAsset: (asset: Omit<MediaAsset, 'id'>) => string
  removeAsset: (id: string) => void
  addClip: (assetId: string, startTime?: number) => string
  removeClip: (id: string) => void
  updateClip: (id: string, updates: Partial<Clip>) => void
  moveClip: (id: string, startTime: number) => void
  addTransition: (type: Transition['type'], clipAId: string, clipBId: string) => void
  removeTransition: (id: string) => void
  updateTransition: (id: string, updates: Partial<Transition>) => void
  undo: () => void
  redo: () => void
  saveHistory: () => void
  getClip: (id: string) => Clip | undefined
  getAsset: (id: string) => MediaAsset | undefined
}

export const useStore = create<EditorState & EditorActions>((set, get) => ({
  project: {
    id: uuidv4(), name: 'Untitled', width: 1920, height: 1080,
    frameRate: 30, duration: 30
  },
  currentTime: 0, isPlaying: false, zoom: 1,
  selectedClipIds: [],
  assets: [], clips: [], transitions: [],
  history: [], historyIndex: -1,

  setCurrentTime: (t) => set(s => ({ currentTime: Math.max(0, Math.min(t, s.project.duration)) })),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
  setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(z, 20)) }),
  
  selectClip: (id, add = false) => set(s => ({
    selectedClipIds: add 
      ? s.selectedClipIds.includes(id) ? s.selectedClipIds.filter(i => i !== id) : [...s.selectedClipIds, id]
      : [id]
  })),

  addAsset: (asset) => {
    const id = uuidv4()
    set(s => ({ assets: [...s.assets, { ...asset, id }] }))
    return id
  },

  removeAsset: (id) => set(s => ({
    assets: s.assets.filter(a => a.id !== id),
    clips: s.clips.filter(c => c.assetId !== id)
  })),

  addClip: (assetId, startTime = 0) => {
    const asset = get().assets.find(a => a.id === assetId)
    const duration = asset?.duration || 3
    const clip: Clip = {
      id: uuidv4(), assetId, startTime, duration,
      inPoint: 0, outPoint: duration,
      transform: { ...DEFAULT_TRANSFORM },
      keyframes: {}, opacity: 1, volume: 1
    }
    set(s => ({ clips: [...s.clips, clip], selectedClipIds: [clip.id] }))
    get().saveHistory()
    return clip.id
  },

  removeClip: (id) => set(s => ({
    clips: s.clips.filter(c => c.id !== id),
    transitions: s.transitions.filter(t => t.clipAId !== id && t.clipBId !== id),
    selectedClipIds: s.selectedClipIds.filter(i => i !== id)
  })),

  updateClip: (id, updates) => set(s => ({
    clips: s.clips.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  moveClip: (id, startTime) => set(s => ({
    clips: s.clips.map(c => c.id === id ? { ...c, startTime: Math.max(0, startTime) } : c)
  })),

  addTransition: (type, clipAId, clipBId) => {
    const transition: Transition = {
      id: uuidv4(), type, clipAId, clipBId, duration: 1,
      params: { intensity: 1, direction: 0 }
    }
    set(s => ({ transitions: [...s.transitions, transition] }))
    get().saveHistory()
  },

  removeTransition: (id) => set(s => ({
    transitions: s.transitions.filter(t => t.id !== id)
  })),

  updateTransition: (id, updates) => set(s => ({
    transitions: s.transitions.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  undo: () => {
    const s = get()
    if (s.historyIndex > 0) {
      const snap = s.history[s.historyIndex - 1]
      set({ clips: snap.clips, transitions: snap.transitions, historyIndex: s.historyIndex - 1 })
    }
  },

  redo: () => {
    const s = get()
    if (s.historyIndex < s.history.length - 1) {
      const snap = s.history[s.historyIndex + 1]
      set({ clips: snap.clips, transitions: snap.transitions, historyIndex: s.historyIndex + 1 })
    }
  },

  saveHistory: () => set(s => {
    const snap = { clips: JSON.parse(JSON.stringify(s.clips)), transitions: JSON.parse(JSON.stringify(s.transitions)) }
    const newHist = s.history.slice(0, s.historyIndex + 1)
    newHist.push(snap)
    if (newHist.length > 50) newHist.shift()
    return { history: newHist, historyIndex: newHist.length - 1 }
  }),

  getClip: (id) => get().clips.find(c => c.id === id),
  getAsset: (id) => get().assets.find(a => a.id === id)
}))
