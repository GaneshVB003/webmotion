import { useEffect, useRef, useCallback, useState } from 'react';
import { useProjectStore } from './stores/projectStore';
import { RenderEngine } from './engines/RenderEngine';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import Timeline from './components/Timeline';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import MenuBar from './components/MenuBar';
import StatusBar from './components/StatusBar';
import ExportModal from './components/ExportModal';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const renderEngineRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  
  const {
    project,
    layers,
    layerOrder,
    currentTime,
    duration,
    frameRate,
    isPlaying,
    isLooping,
    theme,
    zoom,
    showLeftPanel,
    showRightPanel,
    showTimeline,
    leftPanelWidth,
    rightPanelWidth,
    timelineHeight,
    togglePlay,
    setCurrentTime,
    goToStart,
    goToEnd,
    stepForward,
    stepBackward,
    setZoom,
    setTheme,
    undo,
    redo,
    addLayer,
    newProject,
    exportProject,
    importProject
  } = useProjectStore();
  
  // Initialize render engine
  useEffect(() => {
    if (canvasRef.current && !renderEngineRef.current) {
      renderEngineRef.current = new RenderEngine(canvasRef.current);
    }
    
    return () => {
      if (renderEngineRef.current) {
        renderEngineRef.current.destroy();
      }
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (!renderEngineRef.current) return;
    
    const animate = (timestamp) => {
      if (isPlaying) {
        const deltaTime = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;
        
        let newTime = currentTime + deltaTime;
        
        if (newTime >= duration) {
          if (isLooping) {
            newTime = 0;
          } else {
            newTime = duration;
            useProjectStore.getState().pause();
          }
        }
        
        setCurrentTime(newTime);
      }
      
      // Render
      const sortedLayers = layerOrder
        .map(id => layers.find(l => l.id === id))
        .filter(Boolean);
      
      renderEngineRef.current.render(
        sortedLayers,
        currentTime,
        {
          width: project.width,
          height: project.height,
          backgroundColor: project.backgroundColor
        }
      );
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, isLooping, layers, layerOrder, project, setCurrentTime]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      
      // Playback
      if (key === ' ' && !ctrl) {
        e.preventDefault();
        togglePlay();
      }
      if (key === 'arrowleft' && !ctrl) {
        e.preventDefault();
        shift ? goToStart() : stepBackward();
      }
      if (key === 'arrowright' && !ctrl) {
        e.preventDefault();
        shift ? goToEnd() : stepForward();
      }
      if (key === 'home') {
        e.preventDefault();
        goToStart();
      }
      if (key === 'end') {
        e.preventDefault();
        goToEnd();
      }
      
      // Zoom
      if ((ctrl || meta) && (key === '=' || key === '+')) {
        e.preventDefault();
        setZoom(zoom * 1.2);
      }
      if ((ctrl || meta) && key === '-') {
        e.preventDefault();
        setZoom(zoom / 1.2);
      }
      if ((ctrl || meta) && key === '0') {
        e.preventDefault();
        setZoom(1);
      }
      
      // Undo/Redo
      if (ctrl && key === 'z' && !shift) {
        e.preventDefault();
        undo();
      }
      if (ctrl && (key === 'y' || (key === 'z' && shift))) {
        e.preventDefault();
        redo();
      }
      
      // New Layer shortcuts
      if (ctrl && key === 'n') {
        e.preventDefault();
        addLayer('shape');
      }
      
      // Theme toggle
      if (ctrl && key === 't') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, goToStart, goToEnd, stepForward, stepBackward, setZoom, zoom, undo, redo, addLayer, setTheme, theme]);
  
  // Handle file drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const type = file.type.startsWith('image') ? 'image' 
          : file.type.startsWith('video') ? 'video'
          : file.type.startsWith('audio') ? 'audio'
          : 'shape';
        
        if (type === 'image' || type === 'video' || type === 'audio') {
          useProjectStore.getState().addAsset({
            name: file.name,
            type,
            src: event.target.result,
            file
          });
        }
        
        addLayer(type, { src: event.target.result, name: file.name });
      };
      reader.readAsDataURL(file);
    });
  }, [addLayer]);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);
  
  // Export/Import
  const handleExport = useCallback(() => {
    setShowExportModal(true);
  }, []);
  
  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        importProject(data);
      } catch (err) {
        console.error('Failed to import project:', err);
      }
    };
    reader.readAsText(file);
  }, [importProject]);
  
  const handleSaveProject = useCallback(() => {
    const data = exportProject();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'project'}.webmotion`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportProject, project.name]);
  
  return (
    <div 
      className="app" 
      onDrop={handleDrop} 
      onDragOver={handleDragOver}
      data-theme={theme}
    >
      <MenuBar 
        onNewProject={newProject}
        onExport={handleExport}
        onSave={handleSaveProject}
        onImport={handleImport}
        onProjectSettings={() => setShowProjectSettings(true)}
      />
      
      <Toolbar />
      
      <div className="main-content">
        {showLeftPanel && (
          <LeftPanel width={leftPanelWidth} />
        )}
        
        <div className="canvas-area">
          <Canvas ref={canvasRef} />
        </div>
        
        {showRightPanel && (
          <RightPanel width={rightPanelWidth} />
        )}
      </div>
      
      {showTimeline && (
        <Timeline height={timelineHeight} />
      )}
      
      <StatusBar />
      
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
      
      {showProjectSettings && (
        <ProjectSettingsModal onClose={() => setShowProjectSettings(false)} />
      )}
    </div>
  );
}

export default App;
