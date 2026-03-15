import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { X, Download, Film, Image, Volume2 } from 'lucide-react';

function ExportModal({ onClose }) {
  const { project, layers, currentTime } = useProjectStore();
  
  const [exportSettings, setExportSettings] = useState({
    format: 'mp4',
    quality: 'high',
    resolution: 'original',
    fps: project.frameRate,
    duration: 'current',
    startTime: 0,
    endTime: project.duration,
    transparent: false,
    loop: false
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          onClose();
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };
  
  const resolutionOptions = [
    { value: 'original', label: 'Original (1920×1080)' },
    { value: '4k', label: '4K (3840×2160)' },
    { value: '1080p', label: '1080p (1920×1080)' },
    { value: '720p', label: '720p (1280×720)' },
    { value: '480p', label: '480p (854×480)' },
    { value: '360p', label: '360p (640×360)' }
  ];
  
  const formatOptions = [
    { value: 'mp4', label: 'MP4 (H.264)', icon: Film },
    { value: 'webm', label: 'WebM (VP9)', icon: Film },
    { value: 'gif', label: 'GIF (Animated)', icon: Image },
    { value: 'sequence', label: 'Image Sequence (PNG)', icon: Image }
  ];
  
  const qualityOptions = [
    { value: 'high', label: 'High Quality', description: 'Best quality, larger file' },
    { value: 'medium', label: 'Medium Quality', description: 'Balanced' },
    { value: 'low', label: 'Low Quality', description: 'Smaller file size' }
  ];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal export-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export Project</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Format Selection */}
          <div className="form-group">
            <label>Export Format</label>
            <div className="format-grid">
              {formatOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`format-option ${exportSettings.format === opt.value ? 'selected' : ''}`}
                  onClick={() => setExportSettings(s => ({ ...s, format: opt.value }))}
                >
                  <opt.icon size={20} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Resolution */}
          <div className="form-group">
            <label>Resolution</label>
            <select
              value={exportSettings.resolution}
              onChange={(e) => setExportSettings(s => ({ ...s, resolution: e.target.value }))}
            >
              {resolutionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          {/* Quality */}
          <div className="form-group">
            <label>Quality</label>
            <div className="quality-options">
              {qualityOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`quality-option ${exportSettings.quality === opt.value ? 'selected' : ''}`}
                  onClick={() => setExportSettings(s => ({ ...s, quality: e.target.value }))}
                >
                  <span className="quality-label">{opt.label}</span>
                  <span className="quality-desc">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Duration */}
          <div className="form-group">
            <label>Export Duration</label>
            <select
              value={exportSettings.duration}
              onChange={(e) => setExportSettings(s => ({ ...s, duration: e.target.value }))}
            >
              <option value="full">Full Timeline</option>
              <option value="current">Current Frame Only</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Options */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={exportSettings.transparent}
                onChange={(e) => setExportSettings(s => ({ ...s, transparent: e.target.checked }))}
              />
              <span>Export with Transparency (Alpha Channel)</span>
            </label>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={exportSettings.loop}
                onChange={(e) => setExportSettings(s => ({ ...s, loop: e.target.checked }))}
              />
              <span>Loop Video (for GIF)</span>
            </label>
          </div>
          
          {/* Progress */}
          {isExporting && (
            <div className="export-progress">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-text">Exporting... {progress}%</span>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download size={16} />
            Export
          </button>
        </div>
        
        <style>{`
          .export-modal {
            width: 500px;
          }
          
          .format-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          
          .format-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 16px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            color: var(--text-secondary);
            transition: all var(--transition-fast);
          }
          
          .format-option:hover {
            border-color: var(--accent-primary);
            color: var(--text-primary);
          }
          
          .format-option.selected {
            border-color: var(--accent-primary);
            background: rgba(99, 102, 241, 0.1);
            color: var(--accent-primary);
          }
          
          .quality-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .quality-option {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 12px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: var(--radius-md);
            transition: all var(--transition-fast);
          }
          
          .quality-option:hover {
            border-color: var(--accent-primary);
          }
          
          .quality-option.selected {
            border-color: var(--accent-primary);
            background: rgba(99, 102, 241, 0.1);
          }
          
          .quality-label {
            font-weight: 500;
            color: var(--text-primary);
          }
          
          .quality-desc {
            font-size: 11px;
            color: var(--text-muted);
          }
          
          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 13px;
          }
          
          .checkbox-label input {
            width: 16px;
            height: 16px;
          }
          
          .export-progress {
            margin-top: 16px;
            padding: 16px;
            background: var(--bg-tertiary);
            border-radius: var(--radius-md);
          }
          
          .progress-text {
            display: block;
            margin-top: 8px;
            font-size: 12px;
            color: var(--text-secondary);
            text-align: center;
          }
        `}</style>
      </div>
    </div>
  );
}

export default ExportModal;
