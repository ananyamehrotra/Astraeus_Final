import React, { useState, useEffect, useRef } from 'react';

const Globe = () => {
  const cesiumContainer = useRef(null);
  const [viewMode, setViewMode] = useState('3D');
  const [satellites, setSatellites] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [status, setStatus] = useState('Loading Globe...');
  const [globeId] = useState('GLOBE-' + Date.now());
  const [isConnected, setIsConnected] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [trackingMode, setTrackingMode] = useState('AUTO');
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showLockIcon, setShowLockIcon] = useState(false);
  const [showLiveNotification, setShowLiveNotification] = useState(false);

  useEffect(() => {
    fetchSatellites();
    if (viewMode === '3D') {
      initCesium();
    }
    
    return () => {
      const existingScale = document.getElementById('scale-display');
      if (existingScale) existingScale.remove();
      if (window.cesiumViewer) {
        window.cesiumViewer.destroy();
        window.cesiumViewer = null;
      }
    };
  }, [viewMode]);

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

  const initCesium = () => {
    if (!window.Cesium || !cesiumContainer.current || viewMode !== '3D') return;

    try {
      if (window.cesiumViewer) {
        window.cesiumViewer.destroy();
      }
      
      const viewer = new window.Cesium.Viewer(cesiumContainer.current, {
        imageryProvider: new window.Cesium.ArcGisMapServerImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        }),
        baseLayerPicker: true,
        geocoder: true,
        homeButton: true,
        sceneModePicker: false,
        navigationHelpButton: true,
        fullscreenButton: true,
        animation: true,
        timeline: true,
        creditContainer: document.createElement('div')
      });
      
      viewer.scene.globe.enableLighting = true;
      viewer.scene.globe.atmosphereLightIntensity = 3.0;
      viewer.scene.globe.atmosphereSaturationShift = 0.2;
      
      // Style CesiumJS controls
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
          bottomToolbar.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 50, 100, 0.8))';
          bottomToolbar.style.border = '2px solid #00aaff';
          bottomToolbar.style.borderRadius = '12px';
          bottomToolbar.style.backdropFilter = 'blur(15px)';
          bottomToolbar.style.zIndex = '9999';
          bottomToolbar.style.position = 'relative';
          bottomToolbar.style.margin = '10px';
          bottomToolbar.style.boxShadow = '0 0 20px rgba(0, 170, 255, 0.4)';
        }
        
        const animationWidget = document.querySelector('.cesium-animation-widget');
        if (animationWidget) {
          animationWidget.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 30, 60, 0.9))';
          animationWidget.style.border = '2px solid #00aaff';
          animationWidget.style.borderRadius = '10px';
          animationWidget.style.margin = '5px';
          animationWidget.style.boxShadow = '0 0 15px rgba(0, 170, 255, 0.6)';
        }
        
        const timelineWidget = document.querySelector('.cesium-timeline-main');
        if (timelineWidget) {
          timelineWidget.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 30, 60, 0.9))';
          timelineWidget.style.border = '2px solid #00aaff';
          timelineWidget.style.borderRadius = '8px';
          timelineWidget.style.boxShadow = '0 0 15px rgba(0, 170, 255, 0.6)';
        }
      }, 1000);

      // Add scale display
      const existingScales = document.querySelectorAll('[id="scale-display"]');
      existingScales.forEach(scale => scale.remove());
      
      const scaleDisplay = document.createElement('div');
      scaleDisplay.style.position = 'absolute';
      scaleDisplay.style.bottom = '80px';
      scaleDisplay.style.right = '20px';
      scaleDisplay.style.background = 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 50, 50, 0.8))';
      scaleDisplay.style.color = '#00ffff';
      scaleDisplay.style.padding = '12px 16px';
      scaleDisplay.style.borderRadius = '12px';
      scaleDisplay.style.fontSize = '13px';
      scaleDisplay.style.zIndex = '99999';
      scaleDisplay.style.border = '2px solid #00ffff';
      scaleDisplay.style.backdropFilter = 'blur(10px)';
      scaleDisplay.style.fontFamily = 'Consolas, monospace';
      scaleDisplay.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
      scaleDisplay.style.minWidth = '180px';
      scaleDisplay.id = 'scale-display';
      cesiumContainer.current.appendChild(scaleDisplay);
      
      viewer.camera.changed.addEventListener(() => {
        const altitude = viewer.camera.positionCartographic.height;
        const altitudeKm = (altitude / 1000).toFixed(1);
        const scale = altitude > 10000000 ? 'Global' : 
                    altitude > 1000000 ? 'Continental' :
                    altitude > 100000 ? 'Regional' :
                    altitude > 10000 ? 'City' : 'Local';
        scaleDisplay.innerHTML = `
          <div style="font-weight: bold; color: #ffff00; margin-bottom: 5px;">SCALE INDICATOR</div>
          <div>Altitude: ${altitudeKm} km</div>
          <div>Scale: ${scale}</div>
          <div>Zoom Level: ${Math.round(10 - Math.log10(altitude/1000))}</div>
        `;
      });

      viewer.camera.flyTo({
        destination: window.Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 8000000)
      });
      
      // Store viewer globally first
      window.cesiumViewer = viewer;
      
      setStatus('CesiumJS Active');
      
      // Add ISRO ground station marker
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
      
      // Wait for viewer to be fully ready before fetching satellites
      viewer.scene.globe.tileLoadProgressEvent.addEventListener(() => {
        if (viewer.scene.globe.tilesLoaded) {
          fetchCZMLSatellites(viewer);
        }
      });
      
      // Fallback timeout in case tiles don't load
      setTimeout(() => {
        if (viewer && viewer.dataSources) {
          fetchCZMLSatellites(viewer);
        } else {
          addMockSatellites(viewer);
        }
      }, 3000);

    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const fetchCZMLSatellites = async (viewer) => {
    try {
      if (!viewer || !viewer.dataSources) {
        console.error('Viewer not properly initialized');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/satellites/czml?duration_hours=24&step_minutes=5');
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (data.czml && data.czml.length > 1) {
        const czmlDataSource = await window.Cesium.CzmlDataSource.load(data.czml);
        if (viewer && viewer.dataSources) {
          viewer.dataSources.add(czmlDataSource);
        }
        
        czmlDataSource.entities.values.forEach(entity => {
          if (entity.point) {
            entity.point.heightReference = window.Cesium.HeightReference.NONE;
            entity.point.disableDepthTestDistance = Number.POSITIVE_INFINITY;
            entity.point.scaleByDistance = new window.Cesium.NearFarScalar(1.0e3, 2.0, 1.0e7, 0.5);
          }
        });
        
        const startTime = window.Cesium.JulianDate.fromIso8601(data.time_range.start + 'Z');
        const endTime = window.Cesium.JulianDate.fromIso8601(data.time_range.end + 'Z');
        
        viewer.clock.startTime = startTime;
        viewer.clock.stopTime = endTime;
        viewer.clock.currentTime = startTime;
        viewer.clock.clockRange = window.Cesium.ClockRange.LOOP_STOP;
        viewer.clock.multiplier = 1;
        viewer.clock.shouldAnimate = true;
        
        viewer.timeline.zoomTo(startTime, endTime);
        
        setStatus(`✅ LIVE ORBITAL DATA - ${data.satellites_count} satellites`);
        setIsConnected(true);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        
      } else {
        throw new Error('No CZML data');
      }
    } catch (error) {
      console.error('CZML backend connection failed:', error);
      setIsConnected(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Use mock satellites as fallback
      if (viewer && viewer.entities) {
        addMockSatellites(viewer);
      }
    }
  };

  const addMockSatellites = (viewer) => {
    if (!viewer || !viewer.entities) {
      console.error('Viewer not available for mock satellites');
      return;
    }
    
    const mockSats = [
      { name: '🎭 ISS', latitude: 19.41, longitude: -92.00, altitude: 419.05 },
      { name: '🎭 HUBBLE', latitude: 28.5, longitude: -80.6, altitude: 547.0 },
      { name: '🎭 STARLINK-1', latitude: 45.2, longitude: 120.1, altitude: 550.0 },
      { name: '🎭 STARLINK-2', latitude: -15.8, longitude: 45.3, altitude: 550.0 }
    ];
    
    mockSats.forEach((sat, index) => {
      viewer.entities.add({
        id: `mock-satellite-${index}`,
        position: window.Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude * 1000),
        point: {
          pixelSize: 15,
          color: window.Cesium.Color.YELLOW,
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 3,
          heightReference: window.Cesium.HeightReference.NONE
        },
        label: {
          text: sat.name,
          font: '14pt Arial',
          fillColor: window.Cesium.Color.WHITE,
          style: window.Cesium.LabelStyle.FILL,
          pixelOffset: new window.Cesium.Cartesian2(0, -40)
        }
      });
    });
    
    setStatus(`🎭 Mock - ${mockSats.length} satellites`);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={isFullscreen ? fullscreenContainerStyle : {}}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>🌍 3D Mission Control</h1>
      </div>

      {/* Visualization Area */}
      <div style={isFullscreen ? fullscreenVisualizationStyle : visualizationStyle}>
        {viewMode === '3D' ? (
          <div style={globeWrapperStyle}>
            <div 
              ref={cesiumContainer} 
              id={globeId}
              style={cesiumContainerStyle}
            />
            
            {/* Mission Control Panel */}
            <div style={controlPanelStyle}>
              <div style={panelHeaderStyle}>
                ASTRAEUS COMMAND CENTER
              </div>
              
              <div style={statusDisplayStyle}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '6px'}}>
                  <span style={{color: '#ffe066', fontWeight: 'bold'}}>SATELLITES:</span>
                  <span>{satellites.length}</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                  <span style={{color: '#4dff4d', fontWeight: 'bold'}}>CONNECTION:</span>
                  <span style={{color: isConnected ? '#00ff90' : '#ff4444', fontWeight: 'bold'}}>
                    {isConnected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span style={{color: '#ffffff', fontWeight: 'bold', fontSize: '15px'}}>VIEW:</span>
                  {['3D', '2D', 'CV'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        if (window.cesiumViewer && mode !== '2D') {
                          if (mode === '3D') {
                            window.cesiumViewer.scene.morphTo3D(2.0);
                          } else if (mode === 'CV') {
                            window.cesiumViewer.scene.morphToColumbusView(2.0);
                          }
                        }
                      }}
                      style={controlButtonStyle}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (window.cesiumViewer && window.cesiumViewer.clock) {
                    const now = new Date();
                    const julianNow = window.Cesium.JulianDate.fromDate(now);
                    
                    window.cesiumViewer.clock.currentTime = julianNow;
                    window.cesiumViewer.clock.shouldAnimate = true;
                    window.cesiumViewer.clock.multiplier = 1;
                    
                    setShowLiveNotification(true);
                    setTimeout(() => setShowLiveNotification(false), 3000);
                  }
                }}
                style={liveButtonStyle}
              >
                LIVE MODE
              </button>
              
              <button 
                style={fullscreenButtonStyle}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? '🗗 EXIT FULLSCREEN' : '🗖 FULLSCREEN'}
              </button>
            </div>
            
            {/* Corner Accents */}
            <div style={topRightAccentStyle} />
            <div style={bottomLeftAccentStyle} />
            
            {/* Notifications */}
            {showNotification && (
              <div style={{
                ...notificationStyle,
                background: isConnected 
                  ? 'linear-gradient(45deg, #00ff00, #00ff88)' 
                  : 'linear-gradient(45deg, #ff0000, #ff4444)'
              }}>
                {isConnected ? '🟢 BACKEND CONNECTED' : '🔴 BACKEND DISCONNECTED'}
              </div>
            )}
            
            {showLiveNotification && (
              <div style={liveNotificationStyle}>
                🔴 LIVE MODE ACTIVATED<br/>
                <span style={{fontSize: '12px'}}>Real-time at 1x speed</span>
              </div>
            )}
          </div>
        ) : (
          <SatelliteMap satellites={satellites} />
        )}
      </div>
    </div>
  );
};

// 2D Satellite Map Component
const SatelliteMap = ({ satellites }) => {
  return (
    <div style={mapStyle}>
      <svg width="100%" height="100%" style={svgStyle}>
        <rect width="100%" height="100%" fill="#0a0a1a" />
        
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
  background: 'linear-gradient(45deg, #00aaff, #0088cc)',
  color: 'white',
  border: '2px solid #00aaff',
  padding: '8px 15px',
  borderRadius: '10px',
  fontSize: '14px',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace',
  fontWeight: 'bold',
  width: '100%',
  marginTop: '10px',
  boxShadow: '0 0 15px rgba(0, 170, 255, 0.5)'
};

const visualizationStyle = {
  height: 'calc(100vh - 200px)',
  padding: '20px'
};

const fullscreenVisualizationStyle = {
  height: 'calc(100vh - 80px)',
  padding: '0'
};

const globeWrapperStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 25%, #330066 50%, #1a0033 75%, #0a0a0a 100%)',
  border: '3px solid #00ffff',
  borderRadius: '20px',
  boxShadow: '0 0 30px #00ffff, inset 0 0 30px rgba(0, 255, 255, 0.1)',
  overflow: 'hidden'
};

const cesiumContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '17px',
  border: '2px solid rgba(0, 255, 255, 0.3)'
};

const controlPanelStyle = {
  position: 'absolute',
  top: '15px',
  left: '15px',
  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 50, 100, 0.8))',
  backdropFilter: 'blur(10px)',
  border: '2px solid #00ffff',
  color: '#ffffff',
  padding: '20px',
  borderRadius: '20px',
  fontSize: '15px',
  zIndex: 1000,
  fontFamily: 'Consolas, monospace',
  boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
  minWidth: '280px'
};

const panelHeaderStyle = {
  color: '#ffffff',
  fontWeight: 'bold',
  marginBottom: '12px',
  fontSize: '18px',
  textAlign: 'center'
};

const statusDisplayStyle = {
  marginBottom: '15px',
  padding: '16px',
  borderRadius: '12px',
  background: 'linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.7))',
  boxShadow: '0 0 12px rgba(0, 255, 100, 0.25)',
  border: '1px solid rgba(0,255,100,0.4)',
  color: '#fff',
  fontFamily: 'Consolas, monospace'
};

const controlButtonStyle = {
  background: 'rgba(0, 255, 255, 0.2)',
  border: '1px solid #00ffff',
  color: '#ffffff',
  padding: '5px 10px',
  borderRadius: '7px',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace'
};

const liveButtonStyle = {
  background: 'linear-gradient(45deg, #ff0000, #ff4444)',
  color: 'white',
  border: '2px solid #ff6666',
  padding: '8px 15px',
  borderRadius: '10px',
  fontSize: '15px',
  cursor: 'pointer',
  fontFamily: 'Consolas, monospace',
  fontWeight: 'bold',
  width: '100%',
  boxShadow: '0 0 15px rgba(255, 0, 0, 0.5)'
};

const topRightAccentStyle = {
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
};

const bottomLeftAccentStyle = {
  position: 'absolute',
  bottom: '5px',
  left: '5px',
  width: '50px',
  height: '50px',
  background: 'linear-gradient(45deg, transparent 50%, rgba(0, 255, 255, 0.4) 50%)',
  borderTopRight: '2px solid #00ffff',
  borderBottomLeftRadius: '12px',
  zIndex: 1000,
  pointerEvents: 'none',
  boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
};

const notificationStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  color: 'white',
  padding: '12px 20px',
  borderRadius: '25px',
  fontSize: '14px',
  fontWeight: 'bold',
  zIndex: 2000,
  animation: 'pulse 0.5s ease-in-out'
};

const liveNotificationStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'linear-gradient(45deg, #ff0000, #ff4444)',
  color: 'white',
  padding: '15px 25px',
  borderRadius: '25px',
  fontSize: '14px',
  fontWeight: 'bold',
  zIndex: 10000,
  boxShadow: '0 0 30px rgba(255, 0, 0, 0.8)',
  textAlign: 'center'
};

const mapStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '10px',
  overflow: 'hidden'
};

const svgStyle = {
  width: '100%',
  height: '100%'
};

export default Globe;