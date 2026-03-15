# WebMotion - Browser-Based Motion Graphics Editor

## Overview

WebMotion is a professional browser-based motion graphics editor similar to Adobe After Effects or Alight Motion. It runs entirely in the browser using modern web technologies.

## Technology Stack

- **React 18** - UI Framework
- **Zustand** - State Management (with Immer for immutable updates)
- **Vite** - Build tool and dev server
- **WebGL/Canvas 2D** - Rendering engine
- **Lucide React** - Icon library
- **React Colorful** - Color picker component
- **React RND** - Draggable/resizable components

## Project Structure

```
webmotion/
├── src/
│   ├── components/       # React UI components
│   │   ├── Canvas.jsx    # Main canvas area
│   │   ├── Toolbar.jsx   # Top toolbar
│   │   ├── Timeline.jsx # Timeline component
│   │   ├── LeftPanel.jsx # Layers & assets panel
│   │   ├── RightPanel.jsx # Properties panel
│   │   ├── MenuBar.jsx   # Top menu
│   │   ├── StatusBar.jsx # Bottom status
│   │   ├── ExportModal.jsx # Export dialog
│   │   └── ProjectSettingsModal.jsx # Settings dialog
│   │
│   ├── stores/
│   │   └── projectStore.js # Main state (Zustand)
│   │
│   ├── engines/
│   │   ├── RenderEngine.js # Canvas/WebGL rendering
│   │   └── TimelineEngine.js # Timeline interactions
│   │
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── workers/         # Web Workers
│   │
│   ├── App.jsx         # Main app component
│   ├── App.css         # App styles
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
│
├── public/
│   └── favicon.svg    # App icon
│
├── index.html
├── package.json
├── vite.config.js
└── tsconfig.json
```

## Key Features Implemented

### Core System
- ✅ Project creation system
- ✅ Save and load projects (JSON)
- ✅ Auto save system
- ✅ Version history (undo/redo)
- ✅ Layer-based architecture
- ✅ Frame-accurate timeline
- ✅ Multi-track editing
- ✅ Snap to frame system
- ✅ Playback controls (play/pause/loop)
- ✅ Frame stepping
- ✅ Time ruler
- ✅ Zoomable timeline
- ✅ Timeline scrubbing
- ✅ Marker system
- ✅ Project settings panel

### User Interface
- ✅ Dark theme UI
- ✅ Light theme UI
- ✅ Dockable panels
- ✅ Resizable panels
- ✅ Keyboard shortcuts
- ✅ Drag and drop system
- ✅ Layer drag reorder
- ✅ Mobile responsive UI

### Layer System
- ✅ Text layers
- ✅ Image layers
- ✅ Shape layers
- ✅ Video layers
- ✅ Audio layers
- ✅ Group layers
- ✅ Layer visibility toggle
- ✅ Layer locking
- ✅ Layer renaming
- ✅ Layer color labels
- ✅ Layer blending modes
- ✅ Layer duplication

### Transform Controls
- ✅ Position controls
- ✅ Scale controls
- ✅ Rotation controls
- ✅ Opacity controls
- ✅ Numeric input fields
- ✅ Keyframe animation

### Shape Engine
- ✅ Rectangle shapes
- ✅ Circle shapes
- ✅ Ellipse shapes
- ✅ Polygon shapes
- ✅ Star shapes
- ✅ Fill color
- ✅ Stroke width

### Text Engine
- ✅ Font selection
- ✅ Font size control
- ✅ Color control

### Color System
- ✅ Color picker
- ✅ Color presets
- ✅ HEX input

### Export
- ✅ Export to MP4 (simulated)
- ✅ Export to WebM (simulated)
- ✅ Export to GIF (simulated)
- ✅ Export progress monitor

## Running the Project

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect to Vercel through GitHub
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Space | Play/Pause |
| Left Arrow | Step backward |
| Right Arrow | Step forward |
| Home | Go to start |
| End | Go to end |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+N | New layer |
| Ctrl+T | Toggle theme |
| Ctrl++ | Zoom in |
| Ctrl+- | Zoom out |
| Ctrl+0 | Reset zoom |

## State Management

The project uses Zustand with Immer for immutable state updates. All state mutations are handled through actions defined in `projectStore.js`.

## Rendering Pipeline

The `RenderEngine` class handles all canvas rendering:
1. Clear canvas with background color
2. Sort layers by render order
3. Apply blend modes and opacity
4. Apply transforms (position, scale, rotation)
5. Render layer content based on type
6. Interpolate keyframes for animations

## Future Enhancements

- WebGL2 shaders for effects
- FFmpeg WASM for real video export
- Web Workers for heavy processing
- IndexedDB for local storage
- More effects (blur, glow, etc.)
- AI features integration
- Real-time collaboration
