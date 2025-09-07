import React, { useEffect, useState, useRef } from 'react';

const Simple3DGlobe = () => {
  const canvasRef = useRef(null);
  const [satellites, setSatellites] = useState([]);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size properly
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Fetch satellite data immediately
    fetchSatelliteData();
    const interval = setInterval(fetchSatelliteData, 10000);
    
    // Start animation
    animate();
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const fetchSatelliteData = async () => {
    try {
      // Try Phase 1 backend first
      const response = await fetch('http://localhost:5000/api/satellites');
      const data = await response.json();
      
      if (data.satellites) {
        setSatellites(data.satellites);
        return;
      }
    } catch (error) {
      console.log('Backend not available, trying NASA API...');
    }

    try {
      // Fallback to NASA ISS API via main API server proxy
      const issResponse = await fetch('http://localhost:5000/api/nasa/iss-position');
      const issData = await issResponse.json();
      
      const realSatellites = [
        {
          id: 'ISS',
          name: 'International Space Station',
          latitude: parseFloat(issData.iss_position.latitude),
          longitude: parseFloat(issData.iss_position.longitude),
          altitude: 408,
          source: 'NASA API'
        }
      ];
      
      setSatellites(realSatellites);
    } catch (error) {
      // Final fallback
      const mockSatellites = [
        { id: 'ISS', name: 'International Space Station', latitude: 19.41, longitude: -92.00, altitude: 408, source: 'Mock' }
      ];
      setSatellites(mockSatellites);
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Earth
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e3a8a';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw continents (simplified)
    drawContinents(ctx, centerX, centerY, radius);
    
    // Draw ground stations
    drawGroundStations(ctx, centerX, centerY, radius);
    
    // Draw satellites
    drawSatellites(ctx, centerX, centerY, radius);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const drawContinents = (ctx, centerX, centerY, radius) => {
    ctx.fillStyle = '#22c55e';
    
    // Simple continent shapes
    const continents = [
      { x: 0.2, y: 0.3, w: 0.3, h: 0.4 }, // Africa/Europe
      { x: -0.4, y: 0.2, w: 0.25, h: 0.5 }, // Americas
      { x: 0.6, y: 0.1, w: 0.3, h: 0.6 }, // Asia
    ];
    
    continents.forEach(continent => {
      const x = centerX + continent.x * radius;
      const y = centerY + continent.y * radius;
      const w = continent.w * radius;
      const h = continent.h * radius;
      
      ctx.fillRect(x - w/2, y - h/2, w, h);
    });
  };

  const drawGroundStations = (ctx, centerX, centerY, radius) => {
    const stations = [
      { name: 'ISRO Bangalore', lat: 12.97, lon: 77.59 },
      { name: 'ISRO Sriharikota', lat: 13.72, lon: 80.23 },
      { name: 'NASA Houston', lat: 29.76, lon: -95.37 }
    ];
    
    stations.forEach(station => {
      const pos = latLonToCanvas(station.lat, station.lon, centerX, centerY, radius);
      
      // Draw station
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.fillText(station.name, pos.x + 8, pos.y - 8);
    });
  };

  const drawSatellites = (ctx, centerX, centerY, radius) => {
    satellites.forEach(satellite => {
      const pos = latLonToCanvas(satellite.latitude, satellite.longitude, centerX, centerY, radius);
      const altitudeOffset = (satellite.altitude / 1000) * 30; // Scale altitude
      
      // Draw satellite orbit
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + altitudeOffset, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw satellite
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = '#ffff00';
      ctx.font = '9px Arial';
      ctx.fillText(satellite.name, pos.x + 6, pos.y - 6);
    });
  };

  const latLonToCanvas = (lat, lon, centerX, centerY, radius) => {
    // Convert lat/lon to canvas coordinates with proper projection
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    
    // Simple orthographic projection
    const x = centerX + (lonRad / Math.PI) * radius * 0.7;
    const y = centerY - (latRad / (Math.PI / 2)) * radius * 0.7;
    
    return { x, y };
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <canvas 
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: '1px solid #333',
          borderRadius: '8px'
        }}
      />
      
      {/* Control Panel */}
      <div style={controlPanelStyle}>
        <h3>🌍 Satellite Tracking</h3>
        <div style={statsStyle}>
          <div>Satellites: {satellites.length}</div>
          <div>Ground Stations: 3</div>
          <div>Update Rate: 10s</div>
        </div>
        
        <div style={satelliteListStyle}>
          <h4>Active Satellites:</h4>
          {satellites.map(sat => (
            <div key={sat.id} style={satelliteItemStyle}>
              <strong>{sat.name}</strong>
              <br />
              <small>
                Lat: {sat.latitude?.toFixed(2)}°, 
                Lon: {sat.longitude?.toFixed(2)}°, 
                Alt: {sat.altitude?.toFixed(1)}km
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const controlPanelStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '15px',
  borderRadius: '8px',
  minWidth: '250px',
  maxHeight: '400px',
  overflowY: 'auto'
};

const statsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '5px',
  marginBottom: '15px',
  fontSize: '14px'
};

const satelliteListStyle = {
  marginTop: '15px'
};

const satelliteItemStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '8px',
  borderRadius: '4px',
  marginBottom: '8px',
  fontSize: '12px'
};

export default Simple3DGlobe;