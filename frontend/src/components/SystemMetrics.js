/**
 * System Metrics Component
 * Displays real-time system status and performance metrics
 */

import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const SystemMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalSatellites: 0,
    activeWindows: 0,
    groundStations: 0,
    systemStatus: 'initializing',
    lastSimulation: null,
    apiStatus: 'unknown',
    websocketStatus: 'disconnected'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load system metrics from various API endpoints
  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch data from multiple endpoints
      const [satellites, groundStations, windows] = await Promise.allSettled([
        ApiService.getSatellites(),
        ApiService.getGroundStations(),
        ApiService.getCommunicationWindows({ duration_hours: 1 })
      ]);

      const newMetrics = {
        totalSatellites: satellites.status === 'fulfilled' ? satellites.value.length : 0,
        groundStations: groundStations.status === 'fulfilled' ? groundStations.value.length : 0,
        activeWindows: windows.status === 'fulfilled' ? (windows.value.windows || []).length : 0,
        systemStatus: 'operational',
        apiStatus: 'connected',
        websocketStatus: ApiService.isWebSocketConnected() ? 'connected' : 'disconnected',
        lastUpdate: new Date()
      };

      setMetrics(prev => ({ ...prev, ...newMetrics }));
      
    } catch (error) {
      console.error('Error loading system metrics:', error);
      setError('Failed to load system metrics');
      setMetrics(prev => ({ 
        ...prev, 
        systemStatus: 'error',
        apiStatus: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load initial metrics
    loadMetrics();

    // Set up periodic refresh
    const interval = setInterval(loadMetrics, 30000); // Every 30 seconds

    // Set up WebSocket status monitoring
    const wsStatusInterval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        websocketStatus: ApiService.isWebSocketConnected() ? 'connected' : 'disconnected'
      }));
    }, 5000); // Every 5 seconds

    return () => {
      clearInterval(interval);
      clearInterval(wsStatusInterval);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
      case 'connected': 
        return '#4CAF50';
      case 'warning':
      case 'disconnected': 
        return '#FF9800';
      case 'error': 
        return '#F44336';
      case 'initializing': 
        return '#2196F3';
      default: 
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
      case 'connected': 
        return '🟢';
      case 'warning':
      case 'disconnected': 
        return '🟡';
      case 'error': 
        return '🔴';
      case 'initializing': 
        return '🔵';
      default: 
        return '⚪';
    }
  };

  return (
    <div className="system-metrics">
      <div className="metrics-header">
        <h3>📊 System Metrics</h3>
        <button 
          className="btn btn-small" 
          onClick={loadMetrics}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="metrics-grid">
        {/* Core Metrics */}
        <div className="metric-card primary">
          <div className="metric-header">
            <h4>🛰️ Satellites</h4>
            <span className="metric-value">{metrics.totalSatellites}</span>
          </div>
          <p className="metric-description">Tracked satellites</p>
        </div>

        <div className="metric-card primary">
          <div className="metric-header">
            <h4>🏠 Ground Stations</h4>
            <span className="metric-value">{metrics.groundStations}</span>
          </div>
          <p className="metric-description">Available stations</p>
        </div>

        <div className="metric-card primary">
          <div className="metric-header">
            <h4>📡 Active Windows</h4>
            <span className="metric-value">{metrics.activeWindows}</span>
          </div>
          <p className="metric-description">Next hour opportunities</p>
        </div>

        {/* Status Metrics */}
        <div className="metric-card status">
          <div className="metric-header">
            <h4>🖥️ System Status</h4>
            <span 
              className="status-indicator"
              style={{ color: getStatusColor(metrics.systemStatus) }}
            >
              {getStatusIcon(metrics.systemStatus)} {metrics.systemStatus}
            </span>
          </div>
        </div>

        <div className="metric-card status">
          <div className="metric-header">
            <h4>🌐 API Status</h4>
            <span 
              className="status-indicator"
              style={{ color: getStatusColor(metrics.apiStatus) }}
            >
              {getStatusIcon(metrics.apiStatus)} {metrics.apiStatus}
            </span>
          </div>
        </div>

        <div className="metric-card status">
          <div className="metric-header">
            <h4>⚡ WebSocket</h4>
            <span 
              className="status-indicator"
              style={{ color: getStatusColor(metrics.websocketStatus) }}
            >
              {getStatusIcon(metrics.websocketStatus)} {metrics.websocketStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="metrics-info">
        {metrics.lastUpdate && (
          <p>📅 Last Updated: {metrics.lastUpdate.toLocaleTimeString()}</p>
        )}
        
        <div className="system-capabilities">
          <h4>🚀 System Capabilities</h4>
          <ul>
            <li>✅ Real-time satellite tracking</li>
            <li>✅ Communication window detection</li>
            <li>✅ Live data streaming via WebSocket</li>
            <li>✅ REST API for data access</li>
            <li>✅ Ground station management</li>
            <li>✅ Orbital simulation engine</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
