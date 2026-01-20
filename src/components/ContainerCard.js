import React from 'react';
import './ContainerCard.css';

function ContainerCard({ container, isSelected, onClick, history }) {
  const memoryPercentage = (container.memory.used / container.memory.limit) * 100;
  const cpuValue = parseFloat(container.cpu);

  const getStatusColor = (status) => {
    return status === 'running' ? '#10b981' : '#ef4444';
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return '💚';
      case 'unhealthy': return '❤️‍🩹';
      default: return '⚪';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return '#10b981';
      case 'unhealthy': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getCpuColor = (cpu) => {
    if (cpu < 30) return '#10b981';
    if (cpu < 70) return '#f59e0b';
    return '#ef4444';
  };

  const getMemoryColor = (percentage) => {
    if (percentage < 50) return '#10b981';
    if (percentage < 80) return '#f59e0b';
    return '#ef4444';
  };

  const formatBytes = (mb) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  const formatNetwork = (kb) => {
    if (kb >= 1024 * 1024) return `${(kb / (1024 * 1024)).toFixed(1)} GB`;
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  return (
    <div 
      className={`container-card ${container.status} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="container-info">
          <h3 className="container-name">{container.name}</h3>
          <span className="container-image">{container.image}</span>
        </div>
        <div className="status-badges">
          <div 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(container.status) }}
          >
            {container.status}
          </div>
          <div 
            className="health-badge"
            style={{ borderColor: getHealthColor(container.health) }}
            title={`Health: ${container.health}`}
          >
            {getHealthIcon(container.health)}
          </div>
        </div>
      </div>

      <div className="container-id">
        <span className="label">ID:</span>
        <span className="value">{container.id.substring(0, 12)}</span>
        {container.restarts > 0 && (
          <span className="restarts" title="Restart count">
            🔄 {container.restarts}
          </span>
        )}
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-header">
            <span className="metric-label">CPU</span>
            <span className="metric-value" style={{ color: getCpuColor(cpuValue) }}>
              {cpuValue}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(cpuValue, 100)}%`,
                backgroundColor: getCpuColor(cpuValue)
              }}
            />
          </div>
        </div>

        <div className="metric">
          <div className="metric-header">
            <span className="metric-label">Memory</span>
            <span className="metric-value" style={{ color: getMemoryColor(memoryPercentage) }}>
              {memoryPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${memoryPercentage}%`,
                backgroundColor: getMemoryColor(memoryPercentage)
              }}
            />
          </div>
          <span className="metric-detail">
            {formatBytes(container.memory.used)} / {formatBytes(container.memory.limit)}
          </span>
        </div>

        <div className="compact-stats">
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-label">↓ RX</span>
              <span className="stat-value">{formatNetwork(container.network.rx)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">↑ TX</span>
              <span className="stat-value">{formatNetwork(container.network.tx)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">PIDs</span>
              <span className="stat-value">{container.pids}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="ports">
          <span className="label">🔌</span>
          <span className="value">{container.ports}</span>
        </div>
        <div className="uptime">
          <span className="label">⏱️</span>
          <span className="value">{container.uptime}</span>
        </div>
      </div>

      {isSelected && (
        <div className="selected-indicator">
          Click for details →
        </div>
      )}
    </div>
  );
}

export default ContainerCard;
