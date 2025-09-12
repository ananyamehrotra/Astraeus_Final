import React, { useState, useEffect } from 'react';
import FinalGlobe from '../components/FinalGlobe';
import NetworkGraphVisualization from '../components/NetworkGraphVisualization';

const Globe = () => {
  const [viewMode, setViewMode] = useState('3D');
  const [satellites, setSatellites] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchSatellites();
  }, []);

  const fetchSatellites = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/satellites');
      if (response.ok) {
        const data = await response.json();
        setSatellites(data.satellites || []);
      }
    } catch (error) {
      console.error('Failed to fetch satellites:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={isFullscreen ? fullscreenContainerStyle : {}}>
      {/* Header with controls */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>🌍 {viewMode} Mission Control</h1>
        <div style={controlsStyle}>
          <div style={toggleContainerStyle}>
            <button 
              style={viewMode === '2D' ? activeToggleStyle : inactiveToggleStyle}
              onClick={() => setViewMode('2D')}
            >
              📊 2D
            </button>
            <button 
              style={viewMode === '3D' ? activeToggleStyle : inactiveToggleStyle}
              onClick={() => setViewMode('3D')}
            >
              🌍 3D
            </button>
          </div>
          <button 
            style={fullscreenButtonStyle}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? '🗗 Exit' : '🗖 Fullscreen'}
          </button>
        </div>
      </div>

      {/* Visualization Area */}
      <div style={isFullscreen ? fullscreenVisualizationStyle : visualizationStyle}>
        {viewMode === '3D' ? (
          <div style={globeContainerStyle}>
            <FinalGlobe />
          </div>
        ) : (
          <div style={mapContainerStyle}>
            <SatelliteMap satellites={satellites} />
          </div>
        )}
      </div>

      {/* Info Panel (hidden in fullscreen) */}
      {!isFullscreen && (
        <div style={infoPanelStyle}>
          <div style={infoCardStyle}>
            <h3>📊 View Controls</h3>
            <p><strong>Current Mode:</strong> {viewMode}</p>
            <p><strong>Satellites:</strong> {satellites.length} tracked</p>
            <p><strong>Updates:</strong> Real-time</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 2D Satellite Map Component
const SatelliteMap = ({ satellites }) => {
  return (
    <div style={mapStyle}>
      <svg width="100%" height="100%" style={svgStyle}>
        {/* World Map Outline */}
        <rect width="100%" height="100%" fill="#0a0a1a" />
        
        {/* Grid Lines */}
        {Array.from({length: 19}, (_, i) => (
          <line 
            key={`lat-${i}`}
            x1="0" 
            y1={`${(i * 100) / 18}%`} 
            x2="100%" 
            y2={`${(i * 100) / 18}%`}
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="0.5"
          />
        ))}
        {Array.from({length: 37}, (_, i) => (
          <line 
            key={`lon-${i}`}
            x1={`${(i * 100) / 36}%`} 
            y1="0" 
            x2={`${(i * 100) / 36}%`} 
            y2="100%"
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="0.5"
          />
        ))}
        
        {/* Satellites */}
        {satellites.map((sat, index) => {
          const x = ((sat.longitude + 180) / 360) * 100;
          const y = ((90 - sat.latitude) / 180) * 100;
          return (
            <g key={sat.name || index}>
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#00ff00"
                stroke="#ffffff"
                strokeWidth="1"
              >
                <animate
                  attributeName="r"
                  values="4;6;4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={`${x}%`}
                y={`${y - 2}%`}
                fill="#ffffff"
                fontSize="10"
                textAnchor="middle"
                dy="-5"
              >
                {sat.name}
              </text>
            </g>
          );
        })}
        
        {/* Equator */}
        <line 
          x1="0" 
          y1="50%" 
          x2="100%" 
          y2="50%"
          stroke="#ffff00" 
          strokeWidth="2"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

// Styles
const fullscreenContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
  zIndex: 1000,
  overflow: 'hidden'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
};

const titleStyle = {
  margin: 0,
  color: '#ffffff',
  fontSize: '24px'
};

const controlsStyle = {
  display: 'flex',
  gap: '15px',
  alignItems: 'center'
};

const toggleContainerStyle = {
  display: 'flex',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '25px',
  padding: '2px'
};

const activeToggleStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '20px',
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const inactiveToggleStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '20px',
  background: 'transparent',
  color: 'rgba(255, 255, 255, 0.7)',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const fullscreenButtonStyle = {
  padding: '8px 16px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const visualizationStyle = {
  height: 'calc(100vh - 200px)',
  padding: '20px'
};

const fullscreenVisualizationStyle = {
  height: 'calc(100vh - 80px)',
  padding: '0'
};

const globeContainerStyle = {
  width: '100%',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '10px',
  overflow: 'hidden'
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '10px',
  overflow: 'hidden'
};

const mapStyle = {
  width: '100%',
  height: '100%',
  position: 'relative'
};

const svgStyle = {
  width: '100%',
  height: '100%'
};

const infoPanelStyle = {
  padding: '0 20px 20px'
};

const infoCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  padding: '15px',
  color: 'white'
};

export default Globe;