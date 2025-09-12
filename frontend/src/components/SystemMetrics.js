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
        ApiService.getCommunicationWindows({ duration_hours: 6 })
      ]);

      const satelliteCount = satellites.status === 'fulfilled' ? 
        (satellites.value?.count || satellites.value?.satellites?.length || satellites.value?.length || 0) : 0;
      const stationCount = groundStations.status === 'fulfilled' ? 
        (groundStations.value?.count || groundStations.value?.ground_stations?.length || groundStations.value?.length || 0) : 0;
      const windowCount = windows.status === 'fulfilled' ? 
        (windows.value?.count || windows.value?.windows?.length || windows.value?.length || 0) : 0;

      const newMetrics = {
        totalSatellites: satelliteCount,
        groundStations: stationCount,
        activeWindows: windowCount,
        systemStatus: 'operational',
        apiStatus: 'connected',
        websocketStatus: ApiService.isWebSocketConnected() ? 'connected' : 'disconnected',
        lastUpdate: new Date()
      };

      // Show notifications for status changes
      if (metrics.apiStatus !== 'connected' && newMetrics.apiStatus === 'connected') {
        window.showNotification?.('success', '🌐 API Connection Established', '🚀');
      }
      if (metrics.websocketStatus !== 'connected' && newMetrics.websocketStatus === 'connected') {
        window.showNotification?.('success', '⚡ Real-time Stream Active', '🛰️');
      }
      if (metrics.systemStatus !== 'operational' && newMetrics.systemStatus === 'operational') {
        window.showNotification?.('success', '🖥️ Mission Control Online', '✨');
      }

      setMetrics(prev => ({ ...prev, ...newMetrics }));
      
    } catch (error) {
      console.error('Error loading system metrics:', error);
      setError('Failed to load system metrics');
      
      // Show error notification
      window.showNotification?.('error', '⚠️ Connection Lost', '🔴');
      
      setMetrics(prev => ({ 
        ...prev, 
        systemStatus: 'error',
        apiStatus: 'error',
        lastUpdate: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Show initial connection notifications
    setTimeout(() => {
      window.showNotification?.('info', '🚀 Initializing Mission Control...', '⚡');
    }, 500);
    
    setTimeout(() => {
      window.showNotification?.('success', '🛰️ Satellite Network Online', '🌟');
    }, 1500);
    
    // Load initial metrics
    loadMetrics();

    // Set up periodic refresh
    const interval = setInterval(loadMetrics, 30000); // Every 30 seconds

    // Set up WebSocket status monitoring
    const wsStatusInterval = setInterval(() => {
      const wsConnected = ApiService.isWebSocketConnected();
      setMetrics(prev => {
        // Show notification on WebSocket reconnection
        if (prev.websocketStatus === 'disconnected' && wsConnected) {
          window.showNotification?.('success', '⚡ WebSocket Reconnected', '🔄');
        }
        return {
          ...prev,
          websocketStatus: wsConnected ? 'connected' : 'disconnected'
        };
      });
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
            <h4>📡 Communication Windows</h4>
            <span className="metric-value">{metrics.activeWindows}</span>
          </div>
          <p className="metric-description">Next 6 hours</p>
        </div>
      </div>

      {/* Last Updated Only */}
      <div className="metrics-info">
        {metrics.lastUpdate && (
          <p>📅 Last Updated: {metrics.lastUpdate.toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
};

export default SystemMetrics;
