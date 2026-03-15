import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { X } from 'lucide-react';

function ProjectSettingsModal({ onClose }) {
  const { project, setProject, setDuration, setFrameRate } = useProjectStore();
  
  const [settings, setSettings] = useState({
    name: project.name,
    width: project.width,
    height: project.height,
    frameRate: project.frameRate,
    duration: project.duration,
    backgroundColor: project.backgroundColor,
    aspectRatio: project.aspectRatio
  });
  
  const aspectRatios = [
    { value: '16:9', label: '16:9 HD', width: 1920, height: 1080 },
    { value: '9:16', label: '9:16 Vertical', width: 1080, height: 1920 },
    { value: '1:1', label: '1:1 Square', width: 1080, height: 1080 },
    { value: '4:3', label: '4:3 Standard', width: 1440, height: 1080 },
    { value: '21:9', label: '21:9 Ultrawide', width: 2560, height: 1080 },
    { value: '4:5', label: '4:5 Instagram', width: 1080, height: 1350 },
    { value: 'custom', label: 'Custom', width: null, height: null }
  ];
  
  const frameRates = [24, 25, 30, 60, 120];
  
  const handleAspectRatioChange = (ratio) => {
    if (ratio.value !== 'custom') {
      setSettings(s => ({
        ...s,
        aspectRatio: ratio.value,
        width: ratio.width,
        height: ratio.height
      }));
    }
  };
  
  const handleSave = () => {
    setProject({
      name: settings.name,
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
      backgroundColor: settings.backgroundColor,
      aspectRatio: settings.aspectRatio
    });
    setDuration(settings.duration);
    setFrameRate(settings.frameRate);
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Project Settings</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Project Name */}
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))}
              placeholder="My Project"
            />
          </div>
          
          {/* Aspect Ratio */}
          <div className="form-group">
            <label>Aspect Ratio</label>
            <div className="aspect-ratio-grid">
              {aspectRatios.map(ratio => (
                <button
                  key={ratio.value}
                  className={`aspect-ratio-option ${settings.aspectRatio === ratio.value ? 'selected' : ''}`}
                  onClick={() => handleAspectRatioChange(ratio)}
                >
                  <div 
                    className="aspect-ratio-preview"
                    style={{
                      aspectRatio: ratio.value === 'custom' ? 'auto' : `${ratio.value.replace(':', '/')}`
                    }}
                  />
                  <span>{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Resolution */}
          <div className="form-group">
            <label>Resolution</label>
            <div className="resolution-inputs">
              <div className="resolution-input">
                <span>Width</span>
                <input
                  type="number"
                  value={settings.width}
                  onChange={(e) => setSettings(s => ({ 
                    ...s, 
                    width: parseInt(e.target.value) || 0,
                    aspectRatio: 'custom'
                  }))}
                  min={1}
                  max={8192}
                />
                <span>px</span>
              </div>
              <span className="resolution-separator">×</span>
              <div className="resolution-input">
                <span>Height</span>
                <input
                  type="number"
                  value={settings.height}
                  onChange={(e) => setSettings(s => ({ 
                    ...s, 
                    height: parseInt(e.target.value) || 0,
                    aspectRatio: 'custom'
                  }))}
                  min={1}
                  max={8192}
                />
                <span>px</span>
              </div>
            </div>
          </div>
          
          {/* Frame Rate */}
          <div className="form-group">
            <label>Frame Rate</label>
            <div className="framerate-options">
              {frameRates.map(rate => (
                <button
                  key={rate}
                  className={`framerate-option ${settings.frameRate === rate ? 'selected' : ''}`}
                  onClick={() => setSettings(s => ({ ...s, frameRate: rate }))}
                >
                  {rate} fps
                </button>
              ))}
              <input
                type="number"
                value={settings.frameRate}
                onChange={(e) => setSettings(s => ({ ...s, frameRate: parseInt(e.target.value) || 30 }))}
                min={1}
                max={240}
                className="custom-framerate"
              />
            </div>
          </div>
          
          {/* Duration */}
          <div className="form-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              value={settings.duration}
              onChange={(e) => setSettings(s => ({ ...s, duration: parseFloat(e.target.value) || 1 }))}
              min={0.1}
              max={3600}
              step={0.1}
            />
          </div>
          
          {/* Background Color */}
          <div className="form-group">
            <label>Background Color</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                className="color-input"
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                className="color-hex-input"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
          
          {/* Info */}
          <div className="settings-info">
            <p>Total Frames: {Math.floor(settings.duration * settings.frameRate)}</p>
            <p>Pixel Count: {settings.width * settings.height.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
        
        <style>{`
          .settings-modal {
            width: 500px;
          }
          
          .aspect-ratio-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          
          .aspect-ratio-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 12px 8px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 11px;
            color: var(--text-secondary);
            transition: all var(--transition-fast);
          }
          
          .aspect-ratio-option:hover {
            border-color: var(--accent-primary);
          }
          
          .aspect-ratio-option.selected {
            border-color: var(--accent-primary);
            background: rgba(99, 102, 241, 0.1);
            color: var(--accent-primary);
          }
          
          .aspect-ratio-preview {
            width: 40px;
            height: 28px;
            background: var(--accent-primary);
            border-radius: 2px;
          }
          
          .resolution-inputs {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .resolution-input {
            display: flex;
            align-items: center;
            gap: 6px;
            flex: 1;
          }
          
          .resolution-input span {
            font-size: 12px;
            color: var(--text-muted);
          }
          
          .resolution-input input {
            width: 80px;
            padding: 8px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            font-size: 14px;
            font-family: var(--font-mono);
            text-align: center;
          }
          
          .resolution-separator {
            font-size: 18px;
            color: var(--text-muted);
          }
          
          .framerate-options {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          
          .framerate-option {
            padding: 8px 16px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 13px;
            color: var(--text-secondary);
            transition: all var(--transition-fast);
          }
          
          .framerate-option:hover {
            border-color: var(--accent-primary);
            color: var(--text-primary);
          }
          
          .framerate-option.selected {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
            color: white;
          }
          
          .custom-framerate {
            width: 80px;
            padding: 8px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 13px;
            font-family: var(--font-mono);
            text-align: center;
          }
          
          .color-input-wrapper {
            display: flex;
            gap: 8px;
          }
          
          .color-input {
            width: 48px;
            height: 38px;
            padding: 2px;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            cursor: pointer;
          }
          
          .color-hex-input {
            flex: 1;
            padding: 8px 12px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            font-family: var(--font-mono);
            font-size: 14px;
            text-transform: uppercase;
          }
          
          .settings-info {
            margin-top: 16px;
            padding: 12px;
            background: var(--bg-tertiary);
            border-radius: var(--radius-md);
            font-size: 12px;
            color: var(--text-muted);
          }
          
          .settings-info p {
            margin: 4px 0;
          }
        `}</style>
      </div>
    </div>
  );
}

export default ProjectSettingsModal;
