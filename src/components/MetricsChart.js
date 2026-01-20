import React from 'react';
import './MetricsChart.css';

function MetricsChart({ history, container }) {
  if (!history || history.cpu.length === 0) {
    return (
      <div className="metrics-chart">
        <div className="chart-header">
          <h3>📈 Performance History</h3>
        </div>
        <div className="chart-loading">Collecting data...</div>
      </div>
    );
  }

  const maxCpu = Math.max(...history.cpu, 10);
  const maxMemory = Math.max(...history.memory, 10);

  const getCpuPath = () => {
    const width = 100 / (history.cpu.length - 1 || 1);
    return history.cpu.map((val, i) => {
      const x = i * width;
      const y = 100 - (val / maxCpu) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getMemoryPath = () => {
    const width = 100 / (history.memory.length - 1 || 1);
    return history.memory.map((val, i) => {
      const x = i * width;
      const y = 100 - (val / maxMemory) * 100;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const currentCpu = history.cpu[history.cpu.length - 1]?.toFixed(1) || 0;
  const currentMemory = history.memory[history.memory.length - 1]?.toFixed(1) || 0;
  const avgCpu = (history.cpu.reduce((a, b) => a + b, 0) / history.cpu.length).toFixed(1);
  const avgMemory = (history.memory.reduce((a, b) => a + b, 0) / history.memory.length).toFixed(1);

  return (
    <div className="metrics-chart">
      <div className="chart-header">
        <h3>📈 Performance History</h3>
        <span className="chart-timeframe">Last {history.cpu.length * 3}s</span>
      </div>

      <div className="chart-stats">
        <div className="stat-box">
          <span className="stat-label">Current CPU</span>
          <span className="stat-value cpu">{currentCpu}%</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Avg CPU</span>
          <span className="stat-value">{avgCpu}%</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Current Memory</span>
          <span className="stat-value memory">{currentMemory}%</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Avg Memory</span>
          <span className="stat-value">{avgMemory}%</span>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-legend">
          <span className="legend-item cpu">● CPU</span>
          <span className="legend-item memory">● Memory</span>
        </div>
        
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-svg">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" className="grid-line" />
          <line x1="0" y1="50" x2="100" y2="50" className="grid-line" />
          <line x1="0" y1="75" x2="100" y2="75" className="grid-line" />
          
          {/* CPU line */}
          <path
            d={getCpuPath()}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="chart-line"
          />
          
          {/* Memory line */}
          <path
            d={getMemoryPath()}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="chart-line"
          />
        </svg>

        <div className="chart-y-labels">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
      </div>

      <div className="container-details">
        <div className="detail-row">
          <span className="detail-label">Image</span>
          <span className="detail-value">{container.image}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Ports</span>
          <span className="detail-value">{container.ports}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Disk I/O</span>
          <span className="detail-value">
            Read: {container.disk.read} KB | Write: {container.disk.write} KB
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">PIDs</span>
          <span className="detail-value">{container.pids} processes</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Restarts</span>
          <span className="detail-value">{container.restarts}</span>
        </div>
      </div>
    </div>
  );
}

export default MetricsChart;
