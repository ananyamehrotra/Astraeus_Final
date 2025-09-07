import React, { useEffect, useRef, useState } from 'react';

const CleanCesiumGlobe = () => {
  const cesiumContainer = useRef(null);
  const [status, setStatus] = useState('Loading...');
  const [satellites, setSatellites] = useState([]);

  useEffect(() => {
    const initCesium = () => {
      if (!window.Cesium || !cesiumContainer.current) {
        setTimeout(initCesium, 100);
        return;
      }

      try {
        // Set Ion token
        window.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';

        // Create viewer with minimal config
        const viewer = new window.Cesium.Viewer(cesiumContainer.current);

        // Add ISRO Bangalore
        viewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716),
          point: {
            pixelSize: 15,
            color: window.Cesium.Color.YELLOW,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: 'ISRO Bangalore',
            font: '14pt Arial',
            fillColor: window.Cesium.Color.WHITE,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new window.Cesium.Cartesian2(0, -40)
          }
        });

        // Fly to India
        viewer.camera.flyTo({
          destination: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 10000000)
        });

        setStatus('CesiumJS Active - Natural Earth Imagery');
        
        // Fetch satellite data
        fetchSatelliteData(viewer);

      } catch (error) {
        console.error('Cesium error:', error);
        setStatus('CesiumJS failed: ' + error.message);
      }
    };

    initCesium();
  }, []);

  const fetchSatelliteData = async (viewer) => {
    try {
      const response = await fetch('http://localhost:5000/api/satellites');
      const data = await response.json();
      
      if (data.satellites) {
        setSatellites(data.satellites);
        setStatus(`Connected - ${data.satellites.length} satellites`);
        
        // Add satellites to globe
        data.satellites.forEach(sat => {
          viewer.entities.add({
            position: window.Cesium.Cartesian3.fromDegrees(
              sat.longitude, 
              sat.latitude, 
              sat.altitude * 1000
            ),
            point: {
              pixelSize: 10,
              color: sat.name.includes('ISS') ? window.Cesium.Color.LIME : window.Cesium.Color.RED,
              outlineColor: window.Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: {
              text: sat.name,
              font: '10pt Arial',
              fillColor: window.Cesium.Color.WHITE,
              pixelOffset: new window.Cesium.Cartesian2(0, -30)
            }
          });
        });
      }
    } catch (error) {
      // Use mock data
      const mockSats = [
        { name: '🎭 ISS (Mock)', latitude: 19.41, longitude: -92.00, altitude: 419.05 },
        { name: '🎭 HUBBLE (Mock)', latitude: 28.5, longitude: -80.6, altitude: 547.0 },
        { name: '🎭 GPS-III (Mock)', latitude: 35.2, longitude: 120.1, altitude: 20200 },
        { name: '🎭 STARLINK (Mock)', latitude: -15.8, longitude: 45.3, altitude: 550 }
      ];
      
      setSatellites(mockSats);
      setStatus(`🎭 Mock data - ${mockSats.length} satellites`);
      
      mockSats.forEach(sat => {
        viewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(
            sat.longitude, 
            sat.latitude, 
            sat.altitude * 1000
          ),
          point: {
            pixelSize: 10,
            color: window.Cesium.Color.YELLOW,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: sat.name,
            font: '10pt Arial',
            fillColor: window.Cesium.Color.WHITE,
            pixelOffset: new window.Cesium.Cartesian2(0, -30)
          }
        });
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <div 
        ref={cesiumContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#000',
          border: '1px solid #333'
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div><strong>Status:</strong> {status}</div>
        <div><strong>Satellites:</strong> {satellites.length}</div>
        <div><strong>Globe:</strong> Natural Earth with Ion imagery</div>
      </div>
    </div>
  );
};

export default CleanCesiumGlobe;