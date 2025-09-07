import React, { useState } from 'react';
import FinalGlobe from '../components/FinalGlobe';
import NetworkGraphVisualization from '../components/NetworkGraphVisualization';
import SatelliteCalculator from '../components/SatelliteCalculator';
import LibraryShowcase from '../components/LibraryShowcase';


const Globe = () => {
  return (
    <div>
      <h1>🌍 3D Mission Control</h1>
      <div className="card">
        <h2>Real-time Satellite Visualization</h2>
        <FinalGlobe />
      </div>
    </div>
  );
};



export default Globe;