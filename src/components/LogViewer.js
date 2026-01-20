import React, { useState } from 'react';
import './LogViewer.css';

function LogViewer({ logs }) {
  const [filter, setFilter] = useState('all');

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const getLevelColor = (level) => {
    switch (level) {
      case 'info': return '#3b82f6';
      case 'warn': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'debug': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="log-viewer">
      <div className="log-header">
        <h3>📜 Container Logs</h3>
        <div className="log-filters">
          {['all', 'info', 'warn', 'error', 'debug'].map(level => (
            <button
              key={level}
              className={`filter-btn ${filter === level ? 'active' : ''}`}
              onClick={() => setFilter(level)}
              style={filter === level ? { borderColor: getLevelColor(level) } : {}}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      
      <div className="log-content">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">No logs matching filter</div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-time">{formatTimestamp(log.timestamp)}</span>
              <span 
                className="log-level"
                style={{ color: getLevelColor(log.level) }}
              >
                [{log.level.toUpperCase()}]
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
      
      <div className="log-footer">
        <span>Showing {filteredLogs.length} of {logs.length} entries</span>
        <span className="auto-scroll">Auto-scroll enabled</span>
      </div>
    </div>
  );
}

export default LogViewer;
