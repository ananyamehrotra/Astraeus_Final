import React, { useState } from 'react';
import Simple3DGlobe from '../components/Simple3DGlobe';
import CleanCesiumGlobe from '../components/CleanCesiumGlobe';
import NetworkGraphVisualization from '../components/NetworkGraphVisualization';
import SatelliteCalculator from '../components/SatelliteCalculator';
import LibraryShowcase from '../components/LibraryShowcase';
import CommunicationWindows from '../components/CommunicationWindows';

const Globe = () => {
  const [viewMode, setViewMode] = useState('enhanced');

  return (
    <div>
      <h1>🌍 3D Mission Control</h1>
      
      <div className="card">
        <h2>Real-time Satellite Visualization</h2>
        <p>Interactive 3D Earth globe showing live satellite positions and ground stations</p>
        
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${viewMode === 'enhanced' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('enhanced')}
          >
            🌍 Enhanced 3D Globe
          </button>
          <button 
            className={`btn ${viewMode === 'simple' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('simple')}
          >
            🎯 Simple View
          </button>
          <button 
            className={`btn ${viewMode === 'network' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('network')}
          >
            🕸️ Network Graph
          </button>
          <button 
            className={`btn ${viewMode === 'calculator' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('calculator')}
          >
            🧮 Satellite Calculator
          </button>
          <button 
            className={`btn ${viewMode === 'showcase' ? 'btn-active' : ''}`}
            onClick={() => setViewMode('showcase')}
          >
            📚 Library Status
          </button>
        </div>
        
        {viewMode === 'enhanced' && <CleanCesiumGlobe />}
        {viewMode === 'simple' && <Simple3DGlobe />}
        {viewMode === 'network' && <NetworkGraphVisualization />}
        {viewMode === 'calculator' && <SatelliteCalculator />}
        {viewMode === 'showcase' && <LibraryShowcase />}
      </div>

      <div className="card">
        <h2>Enhanced Mission Control Features</h2>
        <div style={featuresStyle}>
          <div style={featureStyle}>
            <h3>🌍 CesiumJS Integration</h3>
            <p>Professional 3D Earth with terrain, lighting, and atmospheric effects</p>
          </div>
          <div style={featureStyle}>
            <h3>🕸️ D3.js Network Graphs</h3>
            <p>Interactive network topology with force-directed layouts</p>
          </div>
          <div style={featureStyle}>
            <h3>🧮 Satellite.js Calculations</h3>
            <p>Precise orbital mechanics and look angle computations</p>
          </div>
          <div style={featureStyle}>
            <h3>🗺️ Turf.js Geospatial</h3>
            <p>Advanced geographic analysis and distance calculations</p>
          </div>
          <div style={featureStyle}>
            <h3>📡 Real-time Sync</h3>
            <p>Live backend integration with 10-second updates</p>
          </div>
          <div style={featureStyle}>
            <h3>🎯 Interactive Controls</h3>
            <p>Multiple visualization modes with seamless switching</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Library Integration Status</h2>
        <div style={controlsStyle}>
          <div>✅ <strong>CesiumJS:</strong> 3D globe with terrain and lighting</div>
          <div>✅ <strong>D3.js:</strong> Network graph visualization</div>
          <div>✅ <strong>Satellite.js:</strong> Orbital mechanics calculations</div>
          <div>✅ <strong>Turf.js:</strong> Geospatial analysis and distance</div>
          <div>✅ <strong>Three.js:</strong> Ready for advanced 3D features</div>
          <div>✅ <strong>Backend Sync:</strong> Real-time API integration</div>
        </div>
      </div>

      <CommunicationWindows />
    </div>
  );
};

const featuresStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const featureStyle = {
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  textAlign: 'center'
};

const controlsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '10px',
  marginTop: '15px',
  fontSize: '14px'
};

export default Globe;