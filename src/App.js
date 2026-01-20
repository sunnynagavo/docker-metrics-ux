import React, { useState, useEffect } from 'react';
import './App.css';
import ContainerCard from './components/ContainerCard';
import LogViewer from './components/LogViewer';
import MetricsChart from './components/MetricsChart';

// Mock Docker container metrics data
const mockContainers = [
  {
    id: 'abc123def456',
    name: 'nginx-web',
    image: 'nginx:latest',
    status: 'running',
    health: 'healthy',
    cpu: 2.5,
    memory: { used: 128, limit: 512 },
    network: { rx: 1024, tx: 512 },
    disk: { read: 256, write: 128 },
    pids: 5,
    uptime: '2 days, 5 hours',
    ports: '80:80, 443:443',
    restarts: 0
  },
  {
    id: 'def789ghi012',
    name: 'postgres-db',
    image: 'postgres:15',
    status: 'running',
    health: 'healthy',
    cpu: 8.3,
    memory: { used: 384, limit: 1024 },
    network: { rx: 2048, tx: 1536 },
    disk: { read: 1024, write: 512 },
    pids: 12,
    uptime: '5 days, 12 hours',
    ports: '5432:5432',
    restarts: 0
  },
  {
    id: 'ghi345jkl678',
    name: 'redis-cache',
    image: 'redis:alpine',
    status: 'running',
    health: 'healthy',
    cpu: 1.2,
    memory: { used: 64, limit: 256 },
    network: { rx: 512, tx: 256 },
    disk: { read: 64, write: 32 },
    pids: 4,
    uptime: '1 day, 8 hours',
    ports: '6379:6379',
    restarts: 1
  },
  {
    id: 'jkl901mno234',
    name: 'node-api',
    image: 'node:18-alpine',
    status: 'stopped',
    health: 'none',
    cpu: 0,
    memory: { used: 0, limit: 512 },
    network: { rx: 0, tx: 0 },
    disk: { read: 0, write: 0 },
    pids: 0,
    uptime: 'Stopped',
    ports: '3000:3000',
    restarts: 3
  },
  {
    id: 'mno567pqr890',
    name: 'mongodb',
    image: 'mongo:6',
    status: 'running',
    health: 'unhealthy',
    cpu: 45.7,
    memory: { used: 1800, limit: 2048 },
    network: { rx: 4096, tx: 2048 },
    disk: { read: 2048, write: 1024 },
    pids: 25,
    uptime: '3 days, 20 hours',
    ports: '27017:27017',
    restarts: 2
  }
];

// Mock log entries
const generateLogs = (containerName) => {
  const logTemplates = [
    { level: 'info', message: 'Connection accepted from 10.0.0.1' },
    { level: 'info', message: 'Request processed successfully' },
    { level: 'warn', message: 'High memory usage detected' },
    { level: 'error', message: 'Connection timeout after 30s' },
    { level: 'info', message: 'Health check passed' },
    { level: 'debug', message: 'Cache hit for key: user_session_123' },
    { level: 'info', message: 'New client connected' },
    { level: 'warn', message: 'Slow query detected (>100ms)' },
    { level: 'info', message: 'Background job completed' },
    { level: 'error', message: 'Failed to connect to upstream' },
  ];
  
  return logTemplates.map((log, i) => ({
    timestamp: new Date(Date.now() - (i * 5000)).toISOString(),
    container: containerName,
    level: log.level,
    message: log.message
  }));
};

function App() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [metricsHistory, setMetricsHistory] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchMetrics = () => {
      setTimeout(() => {
        const updatedContainers = mockContainers.map(container => {
          const newCpu = container.status === 'running' 
            ? Math.max(0, Math.min(100, container.cpu + (Math.random() - 0.5) * 10))
            : 0;
          const newMemUsed = container.status === 'running'
            ? Math.min(container.memory.limit, Math.max(0, container.memory.used + Math.floor((Math.random() - 0.5) * 50)))
            : 0;
          
          return {
            ...container,
            cpu: parseFloat(newCpu.toFixed(1)),
            memory: {
              ...container.memory,
              used: newMemUsed
            },
            network: {
              rx: container.status === 'running' ? container.network.rx + Math.floor(Math.random() * 100) : 0,
              tx: container.status === 'running' ? container.network.tx + Math.floor(Math.random() * 50) : 0
            }
          };
        });
        
        setContainers(updatedContainers);
        
        // Update metrics history for charts
        setMetricsHistory(prev => {
          const newHistory = { ...prev };
          updatedContainers.forEach(c => {
            if (!newHistory[c.id]) {
              newHistory[c.id] = { cpu: [], memory: [], timestamps: [] };
            }
            const history = newHistory[c.id];
            history.cpu.push(c.cpu);
            history.memory.push((c.memory.used / c.memory.limit) * 100);
            history.timestamps.push(new Date().toLocaleTimeString());
            
            // Keep only last 20 data points
            if (history.cpu.length > 20) {
              history.cpu.shift();
              history.memory.shift();
              history.timestamps.shift();
            }
          });
          return newHistory;
        });

        // Generate alerts for high resource usage
        const newAlerts = updatedContainers
          .filter(c => c.cpu > 40 || (c.memory.used / c.memory.limit) > 0.8)
          .map(c => ({
            id: `${c.id}-${Date.now()}`,
            container: c.name,
            type: c.cpu > 40 ? 'cpu' : 'memory',
            message: c.cpu > 40 
              ? `High CPU usage: ${c.cpu}%` 
              : `High memory usage: ${((c.memory.used / c.memory.limit) * 100).toFixed(0)}%`,
            timestamp: new Date().toLocaleTimeString()
          }));
        
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
        }
        
        setLoading(false);
      }, 500);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update logs when container is selected
  useEffect(() => {
    if (selectedContainer) {
      setLogs(generateLogs(selectedContainer.name));
      const logInterval = setInterval(() => {
        const newLog = {
          timestamp: new Date().toISOString(),
          container: selectedContainer.name,
          level: ['info', 'warn', 'debug', 'error'][Math.floor(Math.random() * 4)],
          message: `Event processed at ${new Date().toLocaleTimeString()}`
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
      }, 2000);
      return () => clearInterval(logInterval);
    }
  }, [selectedContainer]);

  const runningCount = containers.filter(c => c.status === 'running').length;
  const stoppedCount = containers.filter(c => c.status === 'stopped').length;
  const healthyCount = containers.filter(c => c.health === 'healthy').length;
  const unhealthyCount = containers.filter(c => c.health === 'unhealthy').length;

  const totalCpu = containers.reduce((sum, c) => sum + c.cpu, 0);
  const totalMemory = containers.reduce((sum, c) => sum + c.memory.used, 0);
  const totalMemoryLimit = containers.reduce((sum, c) => sum + c.memory.limit, 0);

  return (
    <div className="app">
      <header className="header">
        <h1>🐳 Docker Container Metrics</h1>
        <p className="subtitle">Real-time monitoring dashboard</p>
        <div className="live-indicator">
          <span className="pulse"></span>
          Live
        </div>
      </header>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="alerts-banner">
          <div className="alerts-header">
            <span>⚠️ Active Alerts ({alerts.length})</span>
            <button onClick={() => setAlerts([])}>Clear All</button>
          </div>
          <div className="alerts-list">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <span className="alert-container">{alert.container}</span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="summary">
        <div className="summary-card">
          <span className="summary-value">{containers.length}</span>
          <span className="summary-label">Total Containers</span>
        </div>
        <div className="summary-card running">
          <span className="summary-value">{runningCount}</span>
          <span className="summary-label">Running</span>
        </div>
        <div className="summary-card stopped">
          <span className="summary-value">{stoppedCount}</span>
          <span className="summary-label">Stopped</span>
        </div>
        <div className="summary-card healthy">
          <span className="summary-value">{healthyCount}</span>
          <span className="summary-label">Healthy</span>
        </div>
        <div className="summary-card unhealthy">
          <span className="summary-value">{unhealthyCount}</span>
          <span className="summary-label">Unhealthy</span>
        </div>
      </div>

      {/* System Overview */}
      <div className="system-overview">
        <h2>System Resources</h2>
        <div className="system-metrics">
          <div className="system-metric">
            <span className="metric-title">Total CPU Usage</span>
            <div className="big-progress">
              <div 
                className="big-progress-fill cpu"
                style={{ width: `${Math.min(totalCpu / containers.length, 100)}%` }}
              />
            </div>
            <span className="metric-detail">{(totalCpu / containers.length).toFixed(1)}% avg across {runningCount} containers</span>
          </div>
          <div className="system-metric">
            <span className="metric-title">Total Memory Usage</span>
            <div className="big-progress">
              <div 
                className="big-progress-fill memory"
                style={{ width: `${(totalMemory / totalMemoryLimit) * 100}%` }}
              />
            </div>
            <span className="metric-detail">{(totalMemory / 1024).toFixed(1)} GB / {(totalMemoryLimit / 1024).toFixed(1)} GB</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading container metrics...</p>
        </div>
      ) : (
        <div className="main-content">
          <div className="containers-section">
            <h2>Containers</h2>
            <div className="container-grid">
              {containers.map(container => (
                <ContainerCard 
                  key={container.id} 
                  container={container}
                  isSelected={selectedContainer?.id === container.id}
                  onClick={() => setSelectedContainer(
                    selectedContainer?.id === container.id ? null : container
                  )}
                  history={metricsHistory[container.id]}
                />
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedContainer && (
            <div className="detail-panel">
              <div className="detail-header">
                <h2>📊 {selectedContainer.name}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedContainer(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="detail-content">
                <MetricsChart 
                  history={metricsHistory[selectedContainer.id]}
                  container={selectedContainer}
                />
                
                <LogViewer logs={logs} />
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>Metrics refresh every 3 seconds • Click a container for details and logs</p>
      </footer>
    </div>
  );
}

export default App;
