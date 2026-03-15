import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { 
  File, FolderOpen, Save, Download, Upload, 
  Settings, Moon, Sun, Undo, Redo,
  Monitor, Smartphone, Tablet
} from 'lucide-react';

function MenuBar({ onNewProject, onExport, onSave, onImport, onProjectSettings }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  
  const {
    theme,
    toggleTheme,
    project,
    setProject,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedLayerIds,
    layers,
    copyLayer,
    pasteLayer,
    duplicateLayer,
    removeLayer
  } = useProjectStore();
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const menuItems = {
    file: [
      { label: 'New Project', shortcut: 'Ctrl+N', action: onNewProject },
      { label: 'Open Project...', shortcut: 'Ctrl+O', action: onImport },
      { label: 'Save Project', shortcut: 'Ctrl+S', action: onSave },
      { label: 'Export...', shortcut: 'Ctrl+E', action: onExport },
      { divider: true },
      { label: 'Project Settings', action: onProjectSettings }
    ],
    edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: undo, disabled: !canUndo() },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: redo, disabled: !canRedo() },
      { divider: true },
      { label: 'Cut', shortcut: 'Ctrl+X', action: () => {} },
      { label: 'Copy', shortcut: 'Ctrl+C', action: () => {} },
      { label: 'Paste', shortcut: 'Ctrl+V', action: () => {} },
      { label: 'Delete', shortcut: 'Del', action: () => selectedLayerIds.forEach(id => removeLayer(id)) }
    ],
    view: [
      { label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', shortcut: 'Ctrl+T', action: toggleTheme },
      { divider: true },
      { label: 'Fullscreen', shortcut: 'F11', action: () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen() }
    ],
    window: [
      { label: 'Media Library', action: () => {} },
      { label: 'Project Panel', action: () => {} },
      { label: 'Properties', action: () => {} },
      { label: 'Timeline', action: () => {} }
    ],
    help: [
      { label: 'Documentation', action: () => window.open('https://webmotion.app/docs') },
      { label: 'Keyboard Shortcuts', action: () => {} },
      { divider: true },
      { label: 'About WebMotion', action: () => {} }
    ]
  };
  
  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };
  
  return (
    <div className="menu-bar" ref={menuRef}>
      <div className="menu-items">
        {Object.keys(menuItems).map(menu => (
          <div key={menu} className="menu-item">
            <button 
              className={`menu-button ${activeMenu === menu ? 'active' : ''}`}
              onClick={() => handleMenuClick(menu)}
            >
              {menu.charAt(0).toUpperCase() + menu.slice(1)}
            </button>
            
            {activeMenu === menu && (
              <div className="menu-dropdown">
                {menuItems[menu].map((item, index) => (
                  item.divider ? (
                    <div key={index} className="menu-divider" />
                  ) : (
                    <button
                      key={index}
                      className={`menu-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!item.disabled) {
                          item.action?.();
                          setActiveMenu(null);
                        }
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="menu-center">
        <span className="project-name">{project.name}</span>
        <span className="project-info">{project.width}×{project.height} • {project.frameRate}fps</span>
      </div>
      
      <div className="menu-right">
        <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      
      <style>{`
        .menu-bar {
          display: flex;
          align-items: center;
          height: 32px;
          padding: 0 8px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
        }
        
        .menu-items {
          display: flex;
          gap: 2px;
        }
        
        .menu-item {
          position: relative;
        }
        
        .menu-button {
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        
        .menu-button:hover,
        .menu-button.active {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        
        .menu-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 200px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          padding: 4px;
          animation: fadeIn 0.1s ease;
        }
        
        .menu-dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          text-align: left;
          transition: background var(--transition-fast);
        }
        
        .menu-dropdown-item:hover:not(.disabled) {
          background: var(--bg-hover);
        }
        
        .menu-dropdown-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .menu-dropdown-item .shortcut {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }
        
        .menu-divider {
          height: 1px;
          background: var(--border-color);
          margin: 4px 8px;
        }
        
        .menu-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .project-name {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .project-info {
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .menu-right {
          display: flex;
          gap: 4px;
        }
        
        .icon-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        
        .icon-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default MenuBar;
