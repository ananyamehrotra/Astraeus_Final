import React, { useEffect, useRef, useState } from 'react';

const FinalGlobe = () => {
  const cesiumContainer = useRef(null);
  const [status, setStatus] = useState('Loading SINGLE Globe...');
  const [satellites, setSatellites] = useState([]);
  const [globeId] = useState('SINGLE-GLOBE-' + Date.now());
  const [isConnected, setIsConnected] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [viewMode, setViewMode] = useState('3D');
  const [trackingMode, setTrackingMode] = useState('AUTO');
  const [scannerActive, setScannerActive] = useState(true);

  useEffect(() => {
    console.log('Initializing SINGLE globe with ID:', globeId);
    
    const initCesium = () => {
      if (!window.Cesium || !cesiumContainer.current) {
        setTimeout(initCesium, 100);
        return;
      }

      try {
        // Destroy any existing viewers first
        if (window.cesiumViewer) {
          window.cesiumViewer.destroy();
        }
        
        // Use Stamen Terrain as default
        const viewer = new window.Cesium.Viewer(cesiumContainer.current, {
          imageryProvider: new window.Cesium.UrlTemplateImageryProvider({
            url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c', 'd'],
            credit: 'Map tiles by Stamen Design'
          }),
          baseLayerPicker: true,
          geocoder: true,
          homeButton: true,
          sceneModePicker: false,
          navigationHelpButton: true,
          fullscreenButton: true,
          animation: true,
          timeline: true
        });
        
        // Style CesiumJS controls with cyberpunk theme
        setTimeout(() => {
          const toolbar = document.querySelector('.cesium-viewer-toolbar');
          if (toolbar) {
            toolbar.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))';
            toolbar.style.border = '2px solid #00ffff';
            toolbar.style.borderRadius = '10px';
            toolbar.style.backdropFilter = 'blur(10px)';
            toolbar.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
          }
          
          const bottomToolbar = document.querySelector('.cesium-viewer-bottom');
          if (bottomToolbar) {
            bottomToolbar.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))';
            bottomToolbar.style.border = '2px solid #ff00ff';
            bottomToolbar.style.borderRadius = '10px';
            bottomToolbar.style.backdropFilter = 'blur(10px)';
            bottomToolbar.style.zIndex = '9999';
            bottomToolbar.style.position = 'relative';
          }
          
          // Ensure all CesiumJS buttons are clickable
          const allButtons = document.querySelectorAll('.cesium-button, .cesium-toolbar-button');
          allButtons.forEach(btn => {
            btn.style.zIndex = '9999';
            btn.style.position = 'relative';
            btn.style.pointerEvents = 'auto';
          });
          
          // Fix timeline and animation controls
          const timeline = document.querySelector('.cesium-timeline-main');
          if (timeline) {
            timeline.style.zIndex = '9999';
            timeline.style.position = 'relative';
          }
          
          const animation = document.querySelector('.cesium-animation-widget');
          if (animation) {
            animation.style.zIndex = '9999';
            animation.style.position = 'relative';
          }
        }, 1000);
        window.cesiumViewer = viewer; // Store globally to prevent duplicates

        viewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716),
          point: {
            pixelSize: 15,
            color: window.Cesium.Color.CYAN,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: '🚀 ISRO Bangalore',
            font: '14pt Arial',
            fillColor: window.Cesium.Color.WHITE,
            style: window.Cesium.LabelStyle.FILL,
            pixelOffset: new window.Cesium.Cartesian2(0, -40)
          }
        });

        // Set home view to your location (India region) with good globe visibility
        viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(e) {
          e.cancel = true;
          viewer.camera.flyTo({
            destination: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 8000000),
            orientation: {
              heading: 0.0,
              pitch: -window.Cesium.Math.PI_OVER_TWO,
              roll: 0.0
            }
          });
        });
        
        // Initial view
        viewer.camera.flyTo({
          destination: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 8000000)
        });
        
        // Add live altitude display
        const toolbar = document.createElement('div');
        toolbar.style.position = 'absolute';
        toolbar.style.bottom = '10px';
        toolbar.style.right = '10px';
        toolbar.style.background = 'rgba(0, 0, 0, 0.8)';
        toolbar.style.color = 'white';
        toolbar.style.padding = '10px';
        toolbar.style.borderRadius = '5px';
        toolbar.style.fontSize = '12px';
        toolbar.style.zIndex = '1000';
        toolbar.id = 'altitude-display';
        cesiumContainer.current.appendChild(toolbar);
        
        // Update altitude display on camera move
        viewer.camera.changed.addEventListener(() => {
          const altitude = viewer.camera.positionCartographic.height;
          const altitudeKm = (altitude / 1000).toFixed(1);
          toolbar.innerHTML = `📏 Altitude: ${altitudeKm} km`;
        });

        setStatus('SINGLE CesiumJS Active');
        fetchSatellites(viewer);

      } catch (error) {
        setStatus('Error: ' + error.message);
      }
    };

    initCesium();
    
    return () => {
      if (window.cesiumViewer) {
        window.cesiumViewer.destroy();
        window.cesiumViewer = null;
      }
    };
  }, []);

  const fetchSatellites = async (viewer) => {
    try {
      console.log('Fetching from backend...');
      const response = await fetch('http://localhost:5000/api/satellites');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Backend data:', data);
      
      if (data.satellites && data.satellites.length > 0) {
        setSatellites(data.satellites);
        setStatus(`✅ LIVE BACKEND DATA - ${data.satellites.length} satellites`);
        
        // Show connection notification
        if (!isConnected) {
          setIsConnected(true);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
        
        // Clear any existing entities first
        viewer.entities.removeAll();
        
        // Re-add ISRO marker
        viewer.entities.add({
          position: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716),
          point: {
            pixelSize: 15,
            color: window.Cesium.Color.CYAN,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 2
          },
          label: {
            text: '🚀 ISRO Bangalore',
            font: '14pt Arial',
            fillColor: window.Cesium.Color.WHITE,
            style: window.Cesium.LabelStyle.FILL,
            pixelOffset: new window.Cesium.Cartesian2(0, -40)
          }
        });
        
        // Add real satellites from backend
        console.log('Adding satellites to globe:', data.satellites);
        data.satellites.forEach((sat, index) => {
          console.log(`Adding satellite ${index + 1}:`, sat.name, 'at', sat.latitude, sat.longitude, sat.altitude);
          viewer.entities.add({
            id: `satellite-${index}`,
            position: window.Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude * 1000),
            point: {
              pixelSize: 15,
              color: index === 0 ? window.Cesium.Color.LIME : 
                     index === 1 ? window.Cesium.Color.CYAN :
                     index === 2 ? window.Cesium.Color.YELLOW :
                     window.Cesium.Color.MAGENTA,
              outlineColor: window.Cesium.Color.WHITE,
              outlineWidth: 3,
              heightReference: window.Cesium.HeightReference.NONE
            },
            label: {
              text: `🛰️ ${sat.name}`,
              font: '14pt Arial',
              fillColor: window.Cesium.Color.WHITE,
              style: window.Cesium.LabelStyle.FILL,
              pixelOffset: new window.Cesium.Cartesian2(0, -40),
              heightReference: window.Cesium.HeightReference.NONE
            }
          });
        });
        console.log(`Total satellites added: ${data.satellites.length}`);
        return;
      } else {
        throw new Error('No satellites in response');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      
      // Show disconnection notification
      if (isConnected) {
        setIsConnected(false);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
      const mockSats = [
        { name: '🎭 ISS', latitude: 19.41, longitude: -92.00, altitude: 419.05 },
        { name: '🎭 HUBBLE', latitude: 28.5, longitude: -80.6, altitude: 547.0 },
        { name: '🎭 STARLINK-1', latitude: 45.2, longitude: 120.1, altitude: 550.0 },
        { name: '🎭 STARLINK-2', latitude: -15.8, longitude: 45.3, altitude: 550.0 },
        { name: '🎭 GPS-III', latitude: 35.2, longitude: -95.1, altitude: 20200.0 },
        { name: '🎭 GALILEO', latitude: -25.8, longitude: 28.3, altitude: 23222.0 },
        { name: '🎭 GLONASS', latitude: 55.2, longitude: 37.6, altitude: 19130.0 },
        { name: '🎭 BEIDOU', latitude: 39.9, longitude: 116.4, altitude: 21528.0 }
      ];
      
      setSatellites(mockSats);
      setStatus(`🎭 Mock - ${mockSats.length} satellites (ISS, Hubble, Starlink, GPS, Galileo, GLONASS, BeiDou)`);
      
      mockSats.forEach((sat, index) => {
        console.log(`Adding mock satellite ${index + 1}:`, sat.name, 'at', sat.latitude, sat.longitude, sat.altitude);
        viewer.entities.add({
          id: `mock-satellite-${index}`,
          position: window.Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude * 1000),
          point: {
            pixelSize: 15,
            color: index === 0 ? window.Cesium.Color.YELLOW : 
                   index === 1 ? window.Cesium.Color.ORANGE :
                   index === 2 ? window.Cesium.Color.RED :
                   window.Cesium.Color.PINK,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 3,
            heightReference: window.Cesium.HeightReference.NONE
          },
          label: {
            text: sat.name,
            font: '14pt Arial',
            fillColor: window.Cesium.Color.WHITE,
            style: window.Cesium.LabelStyle.FILL,
            pixelOffset: new window.Cesium.Cartesian2(0, -40),
            heightReference: window.Cesium.HeightReference.NONE
          }
        });
      });
      console.log(`Total mock satellites added: ${mockSats.length}`);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      position: 'relative',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 25%, #330066 50%, #1a0033 75%, #0a0a0a 100%)',
      border: '3px solid #00ffff',
      borderRadius: '20px',
      boxShadow: '0 0 30px #00ffff, inset 0 0 30px rgba(0, 255, 255, 0.1)',
      overflow: 'hidden'
    }}>
      <div 
        ref={cesiumContainer} 
        id={globeId}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '17px',
          border: '2px solid rgba(0, 255, 255, 0.3)'
        }}
      />
      
      {/* Enhanced Spaceship Control Center */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(255, 0, 255, 0.2) 50%, rgba(0, 255, 0, 0.2) 100%)',
        backdropFilter: 'blur(20px)',
        border: '3px solid #00ffff',
        color: '#00ffff',
        padding: '20px',
        borderRadius: '20px',
        fontSize: '12px',
        zIndex: 1000,
        fontFamily: 'Courier New, monospace',
        boxShadow: '0 0 40px rgba(0, 255, 255, 0.6), inset 0 0 40px rgba(255, 0, 255, 0.2)',
        minWidth: '320px',
        textShadow: '0 0 15px currentColor',
        animation: 'controlPulse 3s ease-in-out infinite'
      }}>
        <div style={{ color: '#ff00ff', fontWeight: 'bold', marginBottom: '12px', fontSize: '16px', textAlign: 'center' }}>
          🚀 ASTRAEUS COMMAND CENTER 🚀
        </div>
        
        {/* Status Display */}
        <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', border: '1px solid #00ff00' }}>
          <div><span style={{ color: '#00ff00' }}>STATUS:</span> <span style={{ color: '#fff' }}>{status}</span></div>
          <div><span style={{ color: '#ffff00' }}>SATELLITES:</span> <span style={{ color: '#fff' }}>{satellites.length}</span></div>
          <div><span style={{ color: '#ff6600' }}>CONNECTION:</span> <span style={{ color: isConnected ? '#00ff00' : '#ff0000' }}>{isConnected ? 'ONLINE' : 'OFFLINE'}</span></div>
        </div>
        
        {/* View Controls */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: '#ff00ff', fontWeight: 'bold', marginBottom: '8px' }}>🌍 VIEW MODE</div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {['3D', '2D', 'CV'].map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  if (window.cesiumViewer) {
                    if (mode === '3D') {
                      window.cesiumViewer.scene.morphTo3D(2.0);
                      console.log('Switched to 3D view');
                    } else if (mode === '2D') {
                      window.cesiumViewer.scene.morphTo2D(2.0);
                      console.log('Switched to 2D view');
                    } else if (mode === 'CV') {
                      window.cesiumViewer.scene.morphToColumbusView(2.0);
                      console.log('Switched to Columbus view');
                    }
                  }
                }}
                style={{
                  background: viewMode === mode ? 'linear-gradient(45deg, #00ff00, #00ff88)' : 'rgba(0, 255, 255, 0.2)',
                  border: '1px solid #00ffff',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                  textShadow: '0 0 5px currentColor'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tracking Controls */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: '#ff00ff', fontWeight: 'bold', marginBottom: '8px' }}>📡 TRACKING</div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {['AUTO', 'MANUAL', 'LOCK'].map(mode => (
              <button
                key={mode}
                onClick={() => {
                  setTrackingMode(mode);
                  if (window.cesiumViewer) {
                    if (mode === 'LOCK' && satellites.length > 0) {
                      // Lock to first satellite with smooth tracking
                      const sat = satellites[0];
                      window.cesiumViewer.camera.flyTo({
                        destination: window.Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude * 1000 + 500000),
                        duration: 3.0
                      });
                      console.log(`Locked to satellite: ${sat.name}`);
                    } else if (mode === 'AUTO') {
                      // Auto home view to India
                      window.cesiumViewer.camera.flyTo({
                        destination: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 8000000),
                        duration: 2.0
                      });
                      console.log('Auto mode: Returned to India view');
                    } else if (mode === 'MANUAL') {
                      // Enable free camera control
                      window.cesiumViewer.scene.screenSpaceCameraController.enableRotate = true;
                      window.cesiumViewer.scene.screenSpaceCameraController.enableZoom = true;
                      window.cesiumViewer.scene.screenSpaceCameraController.enableTilt = true;
                      console.log('Manual mode: Free camera control enabled');
                    }
                  }
                }}
                style={{
                  background: trackingMode === mode ? 'linear-gradient(45deg, #ff00ff, #ff44ff)' : 'rgba(255, 0, 255, 0.2)',
                  border: '1px solid #ff00ff',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New',
                  boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)',
                  textShadow: '0 0 5px currentColor'
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        
        {/* Scanner Toggle */}
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setScannerActive(!scannerActive)}
            style={{
              background: scannerActive ? 'linear-gradient(45deg, #ffff00, #ffff88)' : 'rgba(255, 255, 0, 0.2)',
              border: '2px solid #ffff00',
              color: '#000',
              padding: '8px 15px',
              borderRadius: '12px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'Courier New',
              fontWeight: 'bold',
              width: '100%',
              boxShadow: '0 0 15px rgba(255, 255, 0, 0.4)',
              textShadow: scannerActive ? 'none' : '0 0 5px #ffff00'
            }}
          >
            {scannerActive ? '🟢 SCANNER ACTIVE' : '🔴 SCANNER OFFLINE'}
          </button>
        </div>
        
        <div style={{ fontSize: '10px', color: '#888', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '8px' }}>
          MISSION CONTROL v2.0 | PHASE 6.1
        </div>
      </div>
      
      {/* Live Connection Notification */}
      {showNotification && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: isConnected 
            ? 'linear-gradient(45deg, #00ff00, #00ff88)' 
            : 'linear-gradient(45deg, #ff0000, #ff4444)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 2000,
          boxShadow: isConnected 
            ? '0 0 20px #00ff00, 0 0 40px #00ff00' 
            : '0 0 20px #ff0000, 0 0 40px #ff0000',
          animation: 'pulse 0.5s ease-in-out',
          textShadow: '0 0 10px currentColor'
        }}>
          {isConnected ? '🟢 BACKEND CONNECTED' : '🔴 BACKEND DISCONNECTED'}
        </div>
      )}
      
      {/* Neon Corner Accents */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(225deg, transparent 50%, rgba(255, 0, 255, 0.3) 50%)',
        borderBottomLeft: '3px solid #ff00ff',
        borderTopRightRadius: '17px',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(45deg, transparent 50%, rgba(0, 255, 255, 0.3) 50%)',
        borderTopRight: '3px solid #00ffff',
        borderBottomLeftRadius: '17px',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      
      {/* Scanning Lines Effect - Lower z-index */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0, 255, 255, 0.05) 3px, rgba(0, 255, 255, 0.05) 6px)',
        pointerEvents: 'none',
        zIndex: -1,
        borderRadius: '17px'
      }} />
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes controlPulse {
          0% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6), inset 0 0 40px rgba(255, 0, 255, 0.2); }
          50% { box-shadow: 0 0 60px rgba(0, 255, 255, 0.8), inset 0 0 60px rgba(255, 0, 255, 0.3); }
          100% { box-shadow: 0 0 40px rgba(0, 255, 255, 0.6), inset 0 0 40px rgba(255, 0, 255, 0.2); }
        }
      `}</style>
    </div>
  );
};

export default FinalGlobe;