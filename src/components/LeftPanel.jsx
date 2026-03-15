import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { 
  Layers, Eye, EyeOff, Lock, Unlock, Copy, Trash2,
  ChevronDown, ChevronRight, Plus, FolderOpen
} from 'lucide-react';

function LeftPanel({ width = 280 }) {
  const [activeTab, setActiveTab] = useState('layers');
  const [expandedSections, setExpandedSections] = useState({
    layers: true,
    assets: true,
    presets: false
  });
  
  const {
    layers,
    layerOrder,
    selectedLayerIds,
    selectLayer,
    addLayer,
    removeLayer,
    duplicateLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    reorderLayer,
    assets,
    addAsset
  } = useProjectStore();
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const getLayerIcon = (type) => {
    switch (type) {
      case 'text': return 'T';
      case 'shape': return '□';
      case 'image': return '🖼';
      case 'video': return '🎬';
      case 'audio': return '🔊';
      case 'solid': return '■';
      case 'group': return '📁';
      default: return '○';
    }
  };
  
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('layerIndex', index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('layerIndex'));
    if (fromIndex !== toIndex) {
      reorderLayer(fromIndex, toIndex);
    }
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const type = file.type.startsWith('image/') ? 'image' 
          : file.type.startsWith('video/') ? 'video'
          : file.type.startsWith('audio/') ? 'audio'
          : null;
        
        if (type) {
          addAsset({
            name: file.name,
            type,
            src: event.target.result
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const sortedLayers = [...layers].sort((a, b) => layerOrder.indexOf(a.id) - layerOrder.indexOf(b.id));
  
  return (
    <div className="left-panel" style={{ width }}>
      <div className="panel-tabs">
        <button 
          className={`panel-tab ${activeTab === 'layers' ? 'active' : ''}`}
          onClick={() => setActiveTab('layers')}
        >
          <Layers size={14} /> Layers
        </button>
        <button 
          className={`panel-tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          <FolderOpen size={14} /> Assets
        </button>
      </div>
      
      <div className="panel-content">
        {activeTab === 'layers' && (
          <div className="layers-panel">
            <div className="panel-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('layers')}
              >
                {expandedSections.layers ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Layers ({layers.length})</span>
                <div className="section-actions">
                  <button 
                    className="icon-btn"
                    onClick={() => addLayer('shape')}
                    title="Add Layer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              
              {expandedSections.layers && (
                <div className="layer-list">
                  {sortedLayers.length === 0 ? (
                    <div className="empty-state">
                      <p className="text-muted text-sm">No layers yet</p>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => addLayer('shape')}
                      >
                        Add Layer
                      </button>
                    </div>
                  ) : (
                    sortedLayers.map((layer, index) => (
                      <div
                        key={layer.id}
                        className={`layer-item ${selectedLayerIds.includes(layer.id) ? 'selected' : ''}`}
                        onClick={(e) => selectLayer(layer.id, e.shiftKey)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <span className="layer-icon">{getLayerIcon(layer.type)}</span>
                        <div className="layer-info">
                          <span className="layer-name">{layer.name}</span>
                          <span className="layer-type">{layer.type}</span>
                        </div>
                        <div className="layer-controls">
                          <button
                            className={`icon-btn ${layer.visible ? '' : 'inactive'}`}
                            onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                            title={layer.visible ? 'Hide' : 'Show'}
                          >
                            {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            className={`icon-btn ${layer.locked ? 'inactive' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                            title={layer.locked ? 'Unlock' : 'Lock'}
                          >
                            {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {selectedLayerIds.length > 0 && (
              <div className="layer-actions">
                <button 
                  className="icon-btn"
                  onClick={() => duplicateLayer(selectedLayerIds[0])}
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button 
                  className="icon-btn danger"
                  onClick={() => removeLayer(selectedLayerIds[0])}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'assets' && (
          <div className="assets-panel">
            <div className="panel-section">
              <div className="section-header">
                <span>Asset Library</span>
                <div className="section-actions">
                  <label className="icon-btn">
                    <Plus size={14} />
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*,audio/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
              
              {assets.length === 0 ? (
                <div className="empty-state">
                  <p className="text-muted text-sm">No assets yet</p>
                  <label className="btn btn-primary btn-sm">
                    Import Assets
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/*,audio/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              ) : (
                <div className="asset-grid">
                  {assets.map(asset => (
                    <div key={asset.id} className="asset-item" title={asset.name}>
                      {asset.type === 'image' && (
                        <img src={asset.src} alt={asset.name} />
                      )}
                      {asset.type === 'video' && (
                        <video src={asset.src} />
                      )}
                      {asset.type === 'audio' && (
                        <div className="audio-placeholder">🔊</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .left-panel {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .panel-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }
        
        .panel-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          font-size: 12px;
          color: var(--text-secondary);
          background: transparent;
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }
        
        .panel-tab:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
        
        .panel-tab.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }
        
        .panel-content {
          flex: 1;
          overflow: auto;
          padding: 12px;
        }
        
        .panel-section {
          margin-bottom: 16px;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-secondary);
          cursor: pointer;
        }
        
        .section-actions {
          margin-left: auto;
          display: flex;
          gap: 4px;
        }
        
        .layer-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .layer-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .layer-item:hover {
          background: var(--bg-hover);
        }
        
        .layer-item.selected {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        }
        
        .layer-item.selected .layer-name,
        .layer-item.selected .layer-type {
          color: white;
        }
        
        .layer-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        
        .layer-info {
          flex: 1;
          min-width: 0;
        }
        
        .layer-name {
          display: block;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .layer-type {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .layer-controls {
          display: flex;
          gap: 2px;
        }
        
        .icon-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }
        
        .icon-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        
        .icon-btn.inactive {
          opacity: 0.4;
        }
        
        .icon-btn.danger:hover {
          color: var(--error);
        }
        
        .layer-actions {
          display: flex;
          gap: 4px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }
        
        .asset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        
        .asset-item {
          aspect-ratio: 1;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .asset-item:hover {
          transform: scale(1.05);
        }
        
        .asset-item img,
        .asset-item video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .audio-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .empty-state {
          text-align: center;
          padding: 24px;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default LeftPanel;
