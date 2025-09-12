/**
 * Live Satellite Tracker Component
 * Displays real-time satellite positions and status
 */

import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

const LiveSatelliteTracker = () => {
  const [satellites, setSatellites] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Initialize WebSocket connection and load initial data
    const initializeConnection = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Load initial satellite data from REST API
        const initialSatellites = await ApiService.getSatellites();
        console.log('Initial satellites loaded:', initialSatellites);
        
        if (initialSatellites) {
          // Handle API response format: {satellites: [...], count: N}
          const satelliteList = initialSatellites.satellites || initialSatellites;
          if (satelliteList && satelliteList.length > 0) {
            setSatellites(satelliteList);
          }
        }
        
        // Connect to WebSocket for real-time updates
        await ApiService.connectWebSocket();
        setIsConnected(true);
        setConnectionStatus('connected');
        setErrorMessage('');
        
        // Subscribe to real-time satellite positions
        ApiService.subscribeToSatellites((satelliteData) => {
          console.log('Real-time satellite data received:', satelliteData);
          
          if (Array.isArray(satelliteData)) {
            setSatellites(satelliteData);
          } else if (satelliteData && typeof satelliteData === 'object') {
            // Handle single satellite update or object format
            setSatellites(prev => {
              const updated = [...prev];
              const index = updated.findIndex(sat => sat.id === satelliteData.id || sat.name === satelliteData.name);
              if (index >= 0) {
                updated[index] = { ...updated[index], ...satelliteData };
              } else {
                updated.push(satelliteData);
              }
              return updated;
            });
          }
          
          setLastUpdate(new Date());
        });
        
        // Subscribe to server status
        ApiService.subscribeToStatus((statusData) => {
          console.log('Server status update:', statusData);
        });
        
      } catch (error) {
        console.error('Failed to initialize connection:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        setErrorMessage(error.message || 'Connection failed');
      }
    };

    initializeConnection();



    // Cleanup on unmount
    return () => {
      ApiService.disconnectWebSocket();
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setConnectionStatus('refreshing');
      const freshData = await ApiService.getSatellites();
      if (freshData) {
        const satelliteList = freshData.satellites || freshData;
        if (satelliteList && satelliteList.length > 0) {
          setSatellites(satelliteList);
        }
      }
      setLastUpdate(new Date());
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setErrorMessage('Failed to refresh data');
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'refreshing': return '#2196F3';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Connected';
      case 'connecting': return '🟡 Connecting...';
      case 'refreshing': return '🔄 Refreshing...';
      case 'error': return '🔴 Error';
      default: return '⚪ Unknown';
    }
  };

  return (
    <div className="live-satellite-tracker">
      <div className="tracker-header">
        <h3>🛰️ Live Satellite Tracking</h3>
        <div className="tracker-controls">
          <div 
            className="connection-status" 
            style={{ color: getConnectionStatusColor() }}
          >
            {getConnectionStatusText()}
          </div>
          <button 
            className="btn btn-small" 
            onClick={handleRefresh}
            disabled={connectionStatus === 'connecting' || connectionStatus === 'refreshing'}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {errorMessage && (
        <div className="error-message">
          ⚠️ {errorMessage}
        </div>
      )}
      
      {lastUpdate && (
        <div className="last-update">
          📅 Last Update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
      
      <div className="satellite-grid">
        {satellites.length > 0 ? (
          satellites.map((satellite, index) => (
            <div key={satellite.id || satellite.name || index} className="satellite-card">
              <div className="satellite-header">
                <h4>{satellite.name || satellite.id || `Satellite ${index + 1}`}</h4>
                <div className={`status-indicator ${satellite.status || 'active'}`}></div>
              </div>
              
              <div className="position-data">
                {satellite.latitude !== undefined && (
                  <p>📍 Lat: {satellite.latitude.toFixed(4)}°</p>
                )}
                {satellite.longitude !== undefined && (
                  <p>📍 Lon: {satellite.longitude.toFixed(4)}°</p>
                )}
                {satellite.altitude !== undefined && (
                  <p>🚀 Alt: {satellite.altitude.toFixed(1)} km</p>
                )}
                {satellite.velocity && (
                  <p>⚡ Speed: {satellite.velocity.toFixed(1)} km/s</p>
                )}
                {satellite.next_pass && (
                  <p>⏰ Next Pass: {new Date(satellite.next_pass).toLocaleTimeString()}</p>
                )}
              </div>
              
              {satellite.tle_data && (
                <div className="satellite-meta">
                  <p className="tle-info">📡 TLE: {satellite.tle_data.split('\n')[0]}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-data">
            {connectionStatus === 'connecting' ? (
              <div>🔄 Connecting to satellite tracker...</div>
            ) : connectionStatus === 'error' ? (
              <div>❌ Unable to load satellite data</div>
            ) : (
              <div>📡 Waiting for satellite data...</div>
            )}
          </div>
        )}
      </div>
      
      {satellites.length > 0 && (
        <div className="tracker-summary">
          <p>📊 Tracking {satellites.length} satellite{satellites.length !== 1 ? 's' : ''}</p>
          {isConnected && (
            <p>🔴 Live updates every 10 seconds</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveSatelliteTracker;
