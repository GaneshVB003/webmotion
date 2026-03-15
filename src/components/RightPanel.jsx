import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { HexColorPicker } from 'react-colorful';
import { ChevronDown, ChevronRight, RotateCw, Move, Maximize2 } from 'lucide-react';

function RightPanel({ width = 300 }) {
  const [activeTab, setActiveTab] = useState('properties');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    transform: true,
    style: true,
    effects: false,
    keyframes: false
  });
  
  const {
    layers,
    selectedLayerIds,
    updateLayer,
    setLayerTransform,
    addKeyframe,
    removeKeyframe,
    currentTime,
    addLayer
  } = useProjectStore();
  
  const selectedLayer = layers.find(l => l.id === selectedLayerIds[0]);
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const handleTransformChange = (prop, value) => {
    if (!selectedLayer) return;
    setLayerTransform(selectedLayer.id, { [prop]: parseFloat(value) || 0 });
  };
  
  const handleStyleChange = (prop, value) => {
    if (!selectedLayer) return;
    updateLayer(selectedLayer.id, { [prop]: value });
  };
  
  const handleAddKeyframe = (property) => {
    if (!selectedLayer) return;
    let value;
    
    if (selectedLayer.transform && selectedLayer.transform[property] !== undefined) {
      value = selectedLayer.transform[property];
    } else if (selectedLayer[property] !== undefined) {
      value = selectedLayer[property];
    } else {
      return;
    }
    
    addKeyframe(selectedLayer.id, property, currentTime, value, 'ease-in-out');
  };
  
  const hasKeyframe = (property) => {
    return selectedLayer?.keyframes?.[property]?.length > 0;
  };
  
  const colorPresets = [
    '#ffffff', '#000000', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'
  ];
  
  if (!selectedLayer) {
    return (
      <div className="right-panel" style={{ width }}>
        <div className="panel-tabs">
          <button className="panel-tab active">Properties</button>
        </div>
        <div className="panel-content empty">
          <p className="text-muted">Select a layer to edit its properties</p>
        </div>
        <style>{rightPanelStyles}</style>
      </div>
    );
  }
  
  return (
    <div className="right-panel" style={{ width }}>
      <div className="panel-tabs">
        <button 
          className={`panel-tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button 
          className={`panel-tab ${activeTab === 'effects' ? 'active' : ''}`}
          onClick={() => setActiveTab('effects')}
        >
          Effects
        </button>
      </div>
      
      <div className="panel-content">
        {/* Layer Info */}
        <div className="layer-header">
          <span className="layer-type-badge">{selectedLayer.type}</span>
          <input
            type="text"
            value={selectedLayer.name}
            onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
            className="layer-name-input"
          />
        </div>
        
        {/* Transform Section */}
        <div className="property-section">
          <div className="section-header" onClick={() => toggleSection('transform')}>
            {expandedSections.transform ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Move size={14} />
            <span>Transform</span>
          </div>
          
          {expandedSections.transform && (
            <div className="property-grid">
              <PropertyInput
                label="X"
                value={selectedLayer.transform?.x || 0}
                onChange={(v) => handleTransformChange('x', v)}
                onKeyframe={() => handleAddKeyframe('x')}
                hasKeyframe={hasKeyframe('x')}
              />
              <PropertyInput
                label="Y"
                value={selectedLayer.transform?.y || 0}
                onChange={(v) => handleTransformChange('y', v)}
                onKeyframe={() => handleAddKeyframe('y')}
                hasKeyframe={hasKeyframe('y')}
              />
              <PropertyInput
                label="Scale X"
                value={(selectedLayer.transform?.scaleX || 1) * 100}
                suffix="%"
                onChange={(v) => handleTransformChange('scaleX', v / 100)}
                onKeyframe={() => handleAddKeyframe('scaleX')}
                hasKeyframe={hasKeyframe('scaleX')}
              />
              <PropertyInput
                label="Scale Y"
                value={(selectedLayer.transform?.scaleY || 1) * 100}
                suffix="%"
                onChange={(v) => handleTransformChange('scaleY', v / 100)}
                onKeyframe={() => handleAddKeyframe('scaleY')}
                hasKeyframe={hasKeyframe('scaleY')}
              />
              <PropertyInput
                label="Rotation"
                value={selectedLayer.transform?.rotation || 0}
                suffix="°"
                onChange={(v) => handleTransformChange('rotation', v)}
                onKeyframe={() => handleAddKeyframe('rotation')}
                hasKeyframe={hasKeyframe('rotation')}
              />
              <PropertyInput
                label="Opacity"
                value={(selectedLayer.opacity || 1) * 100}
                suffix="%"
                min={0}
                max={100}
                onChange={(v) => handleStyleChange('opacity', v / 100)}
              />
            </div>
          )}
        </div>
        
        {/* Style Section */}
        <div className="property-section">
          <div className="section-header" onClick={() => toggleSection('style')}>
            {expandedSections.style ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Maximize2 size={14} />
            <span>Style</span>
          </div>
          
          {expandedSections.style && (
            <div className="property-grid">
              {/* Color */}
              <div className="property-row full-width">
                <label>Color</label>
                <div className="color-picker-wrapper">
                  <div 
                    className="color-swatch"
                    style={{ background: selectedLayer.color || selectedLayer.fill || '#6366f1' }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <input
                    type="text"
                    value={selectedLayer.color || selectedLayer.fill || '#6366f1'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="color-input"
                  />
                </div>
              </div>
              
              {showColorPicker && (
                <div className="color-picker-popover">
                  <HexColorPicker 
                    color={selectedLayer.color || selectedLayer.fill || '#6366f1'}
                    onChange={(c) => handleStyleChange('color', c)}
                  />
                  <div className="color-presets">
                    {colorPresets.map(color => (
                      <div
                        key={color}
                        className="color-preset"
                        style={{ background: color }}
                        onClick={() => handleStyleChange('color', color)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Blend Mode */}
              <div className="property-row full-width">
                <label>Blend Mode</label>
                <select
                  value={selectedLayer.blendMode || 'normal'}
                  onChange={(e) => handleStyleChange('blendMode', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                  <option value="color-dodge">Color Dodge</option>
                  <option value="color-burn">Color Burn</option>
                  <option value="hard-light">Hard Light</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="difference">Difference</option>
                  <option value="exclusion">Exclusion</option>
                </select>
              </div>
              
              {/* Layer-specific properties */}
              {selectedLayer.type === 'text' && (
                <>
                  <PropertyInput
                    label="Font Size"
                    value={selectedLayer.fontSize || 48}
                    onChange={(v) => updateLayer(selectedLayer.id, { fontSize: parseFloat(v) })}
                  />
                  <div className="property-row full-width">
                    <label>Font</label>
                    <select
                      value={selectedLayer.fontFamily || 'Inter'}
                      onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                </>
              )}
              
              {selectedLayer.type === 'shape' && (
                <>
                  <div className="property-row full-width">
                    <label>Shape</label>
                    <select
                      value={selectedLayer.shapeType || 'rectangle'}
                      onChange={(e) => updateLayer(selectedLayer.id, { shapeType: e.target.value })}
                    >
                      <option value="rectangle">Rectangle</option>
                      <option value="circle">Circle</option>
                      <option value="ellipse">Ellipse</option>
                      <option value="polygon">Polygon</option>
                      <option value="star">Star</option>
                    </select>
                  </div>
                  <PropertyInput
                    label="Corner R"
                    value={selectedLayer.cornerRadius || 0}
                    onChange={(v) => updateLayer(selectedLayer.id, { cornerRadius: parseFloat(v) })}
                  />
                  <PropertyInput
                    label="Stroke W"
                    value={selectedLayer.strokeWidth || 0}
                    onChange={(v) => updateLayer(selectedLayer.id, { strokeWidth: parseFloat(v) })}
                  />
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Effects Section */}
        <div className="property-section">
          <div className="section-header" onClick={() => toggleSection('effects')}>
            {expandedSections.effects ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Effects</span>
            <button className="add-effect-btn">+ Add</button>
          </div>
          
          {expandedSections.effects && (
            <div className="effects-list">
              <p className="text-muted text-sm">No effects applied</p>
            </div>
          )}
        </div>
      </div>
      
      <style>{rightPanelStyles}</style>
    </div>
  );
}

function PropertyInput({ label, value, onChange, onKeyframe, hasKeyframe, suffix = '', min, max }) {
  return (
    <div className="property-row">
      <label>{label}</label>
      <div className="property-input">
        <input
          type="number"
          value={Math.round(value * 100) / 100}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
        />
        {suffix && <span className="suffix">{suffix}</span>}
        {onKeyframe && (
          <button 
            className={`keyframe-btn ${hasKeyframe ? 'active' : ''}`}
            onClick={onKeyframe}
            title="Add Keyframe"
          >
            ◇
          </button>
        )}
      </div>
    </div>
  );
}

const rightPanelStyles = `
  .right-panel {
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
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
    padding: 10px;
    font-size: 12px;
    color: var(--text-secondary);
    background: transparent;
    border-bottom: 2px solid transparent;
    transition: all var(--transition-fast);
  }
  
  .panel-tab:hover {
    color: var(--text-primary);
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
  
  .panel-content.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  .layer-header {
    margin-bottom: 16px;
  }
  
  .layer-type-badge {
    display: inline-block;
    padding: 2px 8px;
    background: var(--accent-primary);
    border-radius: var(--radius-sm);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: white;
    margin-bottom: 8px;
  }
  
  .layer-name-input {
    width: 100%;
    padding: 8px 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
  }
  
  .property-section {
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
  
  .add-effect-btn {
    margin-left: auto;
    padding: 2px 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    font-size: 11px;
    color: var(--accent-primary);
  }
  
  .property-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding-top: 8px;
  }
  
  .property-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .property-row.full-width {
    grid-column: 1 / -1;
  }
  
  .property-row label {
    font-size: 11px;
    color: var(--text-muted);
  }
  
  .property-input {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .property-input input {
    flex: 1;
    padding: 6px 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-family: var(--font-mono);
  }
  
  .property-input input:focus {
    border-color: var(--accent-primary);
    outline: none;
  }
  
  .property-input .suffix {
    font-size: 11px;
    color: var(--text-muted);
    min-width: 20px;
  }
  
  .property-input select {
    flex: 1;
    padding: 6px 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--text-primary);
  }
  
  .keyframe-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .keyframe-btn:hover {
    background: var(--accent-primary);
    color: white;
  }
  
  .keyframe-btn.active {
    background: var(--accent-primary);
    color: white;
  }
  
  .color-picker-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .color-swatch {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--border-color);
    cursor: pointer;
  }
  
  .color-input {
    flex: 1;
    padding: 6px 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-family: var(--font-mono);
  }
  
  .color-picker-popover {
    grid-column: 1 / -1;
    padding: 12px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
  }
  
  .color-presets {
    display: flex;
    gap: 4px;
    margin-top: 12px;
  }
  
  .color-preset {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: 1px solid var(--border-color);
  }
  
  .effects-list {
    padding-top: 8px;
  }
`;

export default RightPanel;
