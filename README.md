# 🎬 WebMotion - Browser-Based Motion Graphics Editor

A professional-grade motion graphics editor that runs entirely in your browser. Create stunning animations, video edits, and motion graphics without installing any software.

![WebMotion](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-yellow) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Editing
- **Layer-Based Architecture** - Stack multiple layers of text, shapes, images, videos, and audio
- **Frame-Accurate Timeline** - Professional timeline with keyframe support
- **Keyframe Animation** - Animate any property with ease-in, ease-out, and custom curves
- **Multi-Track Editing** - Work with multiple tracks of content

### Layer Types
- **Text Layers** - Custom fonts, sizes, colors, and styling
- **Shape Layers** - Rectangles, circles, polygons, stars with fills and strokes
- **Image Layers** - Import and manipulate images
- **Video Layers** - Add video content
- **Audio Layers** - Add soundtracks and audio effects
- **Solid Layers** - Color background layers
- **Group Layers** - Organize and nest content

### Tools
- Selection tool
- Move tool
- Rotate tool
- Scale tool
- Text tool
- Shape tool
- Pen tool (for custom paths)
- Eyedropper (color picker)

### Effects & Styling
- Blend modes (multiply, screen, overlay, etc.)
- Opacity control
- Layer colors and labels
- Transform controls (position, scale, rotation)
- Layer locking and visibility

### Export Options
- MP4 (H.264)
- WebM (VP9)
- Animated GIF
- PNG Image Sequence
- Custom resolution and quality settings
- Alpha channel (transparency) support

### User Experience
- Dark and Light themes
- Keyboard shortcuts
- Drag and drop support
- Undo/Redo with history
- Project save/load
- Responsive design

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd webmotion

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Or deploy with CI/CD via GitHub integration
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` | Step backward one frame |
| `→` | Step forward one frame |
| `Home` | Go to start |
| `End` | Go to end |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+N` | Add new layer |
| `Ctrl+S` | Save project |
| `Ctrl+O` | Open project |
| `Ctrl+E` | Export |
| `Ctrl+T` | Toggle theme |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |

## 📁 Project Structure

```
webmotion/
├── src/
│   ├── components/       # React UI components
│   │   ├── Canvas.jsx    # Main preview canvas
│   │   ├── Toolbar.jsx   # Top toolbar with tools
│   │   ├── Timeline.jsx  # Timeline component
│   │   ├── LeftPanel.jsx # Layers & assets panel
│   │   ├── RightPanel.jsx # Properties inspector
│   │   ├── MenuBar.jsx   # Application menu
│   │   ├── StatusBar.jsx # Bottom status bar
│   │   └── *.jsx         # Other UI components
│   │
│   ├── stores/
│   │   └── projectStore.js # Zustand state management
│   │
│   ├── engines/
│   │   ├── RenderEngine.js  # Canvas/WebGL rendering
│   │   └── TimelineEngine.js # Timeline interactions
│   │
│   ├── App.jsx         # Main application
│   ├── App.css         # Component styles
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
│
├── public/              # Static assets
├── dist/               # Production build output
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ Technology Stack

- **React 18** - UI framework
- **Zustand** - State management
- **Vite** - Build tool
- **WebGL/Canvas** - Hardware-accelerated rendering
- **Lucide React** - Icon library
- **React Colorful** - Color picker

## 📋 Requirements

- Node.js 18+
- Modern browser (Chrome, Firefox, Safari, Edge)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using modern web technologies
