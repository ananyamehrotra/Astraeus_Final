import React, { useState, useEffect } from 'react';

const Satellites = () => {
  const [selectedSatellite, setSelectedSatellite] = useState('ISS');
  const [missionPriority, setMissionPriority] = useState('normal');
  const [filterStatus, setFilterStatus] = useState('all');
  const [satellites, setSatellites] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchSatellites();
  }, []);

  const fetchSatellites = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/satellites');
      if (response.ok) {
        const data = await response.json();
        const formattedSats = data.satellites.map(sat => ({
          id: sat.name,
          name: sat.name,
          status: 'active',
          altitude: Math.round(sat.altitude),
          speed: Math.round(sat.altitude < 1000 ? 27600 : sat.altitude < 2000 ? 27300 : 14000),
          period: Math.round(sat.altitude < 1000 ? 92 : sat.altitude < 2000 ? 96 : 718),
          power: Math.floor(Math.random() * 30) + 70,
          thermal: 'nominal',
          dataStorage: Math.floor(Math.random() * 60) + 20,
          mission: sat.name.includes('ISS') ? 'Research & Crew Operations' :
                   sat.name.includes('STARLINK') ? 'Internet Communications' :
                   sat.name.includes('CARTOSAT') ? 'Earth Observation' :
                   sat.name.includes('RISAT') ? 'Radar Imaging' : 'Scientific Research',
          priority: sat.name.includes('ISS') || sat.name.includes('CARTOSAT') ? 'high' : 'normal',
          nextPass: new Date(Date.now() + Math.random() * 6 * 3600000).toLocaleTimeString('en-US', {timeZone: 'UTC'}) + ' UTC'
        }));
        setSatellites(formattedSats);
        setIsConnected(true);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.error('Failed to fetch satellites:', error);
      setIsConnected(false);
      // Fallback to mock data
      setSatellites(mockSatellites);
    }
  };

  const mockSatellites = [
    {
      id: 'ISS',
      name: 'International Space Station',
      status: 'active',
      altitude: 419,
      speed: 27600,
      period: 92,
      power: 85,
      thermal: 'nominal',
      dataStorage: 67,
      mission: 'Research & Crew Operations',
      priority: 'high',
      nextPass: '14:23 UTC'
    },
    {
      id: 'HUBBLE',
      name: 'Hubble Space Telescope',
      status: 'active',
      altitude: 547,
      speed: 27300,
      period: 96,
      power: 92,
      thermal: 'nominal',
      dataStorage: 34,
      mission: 'Deep Space Observation',
      priority: 'high',
      nextPass: '16:45 UTC'
    },
    {
      id: 'GPS-III',
      name: 'GPS Block III',
      status: 'active',
      altitude: 20200,
      speed: 14000,
      period: 718,
      power: 78,
      thermal: 'nominal',
      dataStorage: 12,
      mission: 'Global Navigation',
      priority: 'normal',
      nextPass: '18:12 UTC'
    },
    {
      id: 'STARLINK',
      name: 'Starlink Constellation',
      status: 'active',
      altitude: 550,
      speed: 27000,
      period: 95,
      power: 88,
      thermal: 'nominal',
      dataStorage: 45,
      mission: 'Internet Communications',
      priority: 'normal',
      nextPass: '15:30 UTC'
    }
  ];

  const groundStations = [
    {
      id: 'ISRO_BLR',
      name: 'ISRO Bangalore',
      status: 'online',
      location: 'Bangalore, India',
      weather: 'clear',
      elevation: 920,
      activeConnections: 2,
      capacity: 85
    },
    {
      id: 'ISRO_SHAR',
      name: 'ISRO Sriharikota',
      status: 'online',
      location: 'Sriharikota, India',
      weather: 'partly cloudy',
      elevation: 10,
      activeConnections: 1,
      capacity: 92
    },
    {
      id: 'NASA_HST',
      name: 'NASA Houston',
      status: 'online',
      location: 'Houston, USA',
      weather: 'clear',
      elevation: 15,
      activeConnections: 3,
      capacity: 78
    }
  ];

  return (
    <div>
      <h1>🛰️ Satellite Management</h1>
      
      {/* Control Panel */}
      <div className="card">
        <h2>🎛️ Satellite Control Panel <span style={{color: '#00ff00', fontSize: '12px'}}>(R)</span></h2>
        <div style={controlPanelStyle}>
          <div style={controlGroupStyle}>
            <label><strong>Selected Satellite:</strong></label>
            <select value={selectedSatellite} onChange={(e) => setSelectedSatellite(e.target.value)} style={selectStyle}>
              {satellites.map(sat => (
                <option key={sat.id} value={sat.id}>{sat.name}</option>
              ))}
            </select>
          </div>
          <div style={controlGroupStyle}>
            <label><strong>Mission Priority:</strong></label>
            <select value={missionPriority} onChange={(e) => setMissionPriority(e.target.value)} style={selectStyle}>
              <option value="emergency">🚨 Emergency</option>
              <option value="high">🔴 High Priority</option>
              <option value="normal">🟡 Normal</option>
              <option value="low">🟢 Low Priority</option>
            </select>
          </div>
          <div style={controlGroupStyle}>
            <label><strong>Filter Status:</strong></label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
              <option value="all">All Satellites</option>
              <option value="active">Active Only</option>
              <option value="maintenance">Maintenance</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
        <div style={actionButtonsStyle}>
          <button className="btn" style={emergencyButtonStyle}>🚨 Emergency Override</button>
          <button className="btn" style={actionButtonStyle}>📡 Assign Mission</button>
          <button className="btn" style={actionButtonStyle}>🔧 Schedule Maintenance</button>
          <button className="btn" style={actionButtonStyle}>📊 Generate Report</button>
        </div>
      </div>

      {/* Satellite Detail Cards */}
      <div className="card">
        <h2>🛰️ Active Satellites <span style={{color: isConnected ? '#00ff00' : '#ff0000', fontSize: '12px'}}>({isConnected ? 'LIVE' : 'MOCK'})</span></h2>
        <div style={satelliteGridStyle}>
          {satellites.map(satellite => (
            <div key={satellite.id} style={satelliteCardStyle}>
              <div style={satelliteHeaderStyle}>
                <h3>{satellite.name}</h3>
                <div style={statusIndicatorStyle(satellite.status)}>
                  {satellite.status === 'active' ? '🟢' : '🔴'} {satellite.status.toUpperCase()}
                </div>
              </div>
              
              {/* Orbital Parameters */}
              <div style={parameterSectionStyle}>
                <h4>🌍 Orbital Parameters</h4>
                <div style={parameterGridStyle}>
                  <div><strong>Altitude:</strong> {satellite.altitude} km</div>
                  <div><strong>Speed:</strong> {satellite.speed.toLocaleString()} km/h</div>
                  <div><strong>Period:</strong> {satellite.period} min</div>
                  <div><strong>Next Pass:</strong> {satellite.nextPass}</div>
                </div>
              </div>
              
              {/* Hardware Status */}
              <div style={parameterSectionStyle}>
                <h4>⚡ Hardware Status</h4>
                <div style={hardwareGridStyle}>
                  <div style={hardwareItemStyle}>
                    <span>Power:</span>
                    <div style={progressBarStyle}>
                      <div style={{...progressFillStyle, width: `${satellite.power}%`, backgroundColor: satellite.power > 70 ? '#00ff00' : satellite.power > 40 ? '#ffff00' : '#ff0000'}}></div>
                    </div>
                    <span>{satellite.power}%</span>
                  </div>
                  <div style={hardwareItemStyle}>
                    <span>Storage:</span>
                    <div style={progressBarStyle}>
                      <div style={{...progressFillStyle, width: `${satellite.dataStorage}%`, backgroundColor: satellite.dataStorage < 80 ? '#00ff00' : satellite.dataStorage < 90 ? '#ffff00' : '#ff0000'}}></div>
                    </div>
                    <span>{satellite.dataStorage}%</span>
                  </div>
                  <div><strong>Thermal:</strong> <span style={{color: satellite.thermal === 'nominal' ? '#00ff00' : '#ff0000'}}>{satellite.thermal.toUpperCase()}</span></div>
                </div>
              </div>
              
              {/* Mission Info */}
              <div style={parameterSectionStyle}>
                <h4>🎯 Mission Assignment</h4>
                <div><strong>Current Mission:</strong> {satellite.mission}</div>
                <div><strong>Priority:</strong> 
                  <span style={priorityStyle(satellite.priority)}>
                    {satellite.priority === 'high' ? '🔴 HIGH' : satellite.priority === 'normal' ? '🟡 NORMAL' : '🟢 LOW'}
                  </span>
                </div>
              </div>
              
              <div style={satelliteActionsStyle}>
                <button className="btn" style={smallButtonStyle}>📡 Track</button>
                <button className="btn" style={smallButtonStyle}>📊 Details</button>
                <button className="btn" style={smallButtonStyle}>⚙️ Configure</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Advanced Orbital Mechanics */}
      <div className="card">
        <h2>🌌 Advanced Orbital Mechanics <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={orbitalMechanicsStyle}>
          <div style={perturbationStyle}>
            <h4>🌬️ Atmospheric Drag Effects</h4>
            <div>ISS Drag: -2.1 m/s per day (altitude decay)</div>
            <div>Hubble Drag: -0.8 m/s per day (higher orbit)</div>
            <div>Starlink Drag: -3.4 m/s per day (active correction)</div>
          </div>
          <div style={perturbationStyle}>
            <h4>☀️ Solar Radiation Pressure</h4>
            <div>GPS-III: +0.3 m/s per day (solar panels)</div>
            <div>Hubble: +0.7 m/s per day (large surface area)</div>
            <div>ISS: +0.2 m/s per day (complex geometry)</div>
          </div>
          <div style={perturbationStyle}>
            <h4>🌙 Gravitational Perturbations</h4>
            <div>Moon Effect: ±0.1 m/s (28-day cycle)</div>
            <div>Sun Effect: ±0.05 m/s (annual variation)</div>
            <div>Earth Oblateness: Continuous precession</div>
          </div>
        </div>
      </div>

      {/* Hardware Constraints Modeling */}
      <div className="card">
        <h2>⚡ Hardware Constraints & Thermal Management <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={hardwareConstraintsStyle}>
          <div style={constraintCategoryStyle}>
            <h4>🔋 Power Management</h4>
            <div>Solar Panel Efficiency: 22.5% (degrading 0.5%/year)</div>
            <div>Battery Cycles: 15,847 / 50,000 (ISS)</div>
            <div>Power Budget: 847W available, 723W used</div>
            <div>Eclipse Duration: 35 minutes per orbit</div>
          </div>
          <div style={constraintCategoryStyle}>
            <h4>🌡️ Thermal Constraints</h4>
            <div>Operating Range: -40°C to +85°C</div>
            <div>Current Temp: +23°C (nominal)</div>
            <div>Thermal Cycling: 16 cycles/day</div>
            <div>Radiator Efficiency: 94.2%</div>
          </div>
          <div style={constraintCategoryStyle}>
            <h4>💾 Data Storage Limits</h4>
            <div>Total Capacity: 2.4 TB solid-state</div>
            <div>Current Usage: 67% (1.6 TB)</div>
            <div>Write Cycles: 2.3M / 10M limit</div>
            <div>Compression Ratio: 3.2:1 average</div>
          </div>
        </div>
      </div>

      {/* Mission Priority Hierarchies */}
      <div className="card">
        <h2>🎯 Mission Priority & Emergency Protocols <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={prioritySystemStyle}>
          <div style={priorityLevelStyle}>
            <h4>🚨 EMERGENCY (Priority 1)</h4>
            <div>🔥 Wildfire Monitoring: Immediate data relay</div>
            <div>🌊 Tsunami Warning: 30-second response time</div>
            <div>🚀 Crew Safety: ISS emergency communications</div>
            <div>📰 Military: Classified payload priority</div>
          </div>
          <div style={priorityLevelStyle}>
            <h4>🔴 HIGH (Priority 2)</h4>
            <div>🔭 Scientific Research: Hubble observations</div>
            <div>🗺️ Navigation: GPS constellation maintenance</div>
            <div>🌍 Earth Observation: Climate monitoring</div>
          </div>
          <div style={priorityLevelStyle}>
            <h4>🟡 NORMAL (Priority 3)</h4>
            <div>📶 Internet: Starlink user traffic</div>
            <div>📺 Broadcasting: Satellite TV/radio</div>
            <div>📞 Communications: Standard voice/data</div>
          </div>
        </div>
      </div>

      {/* Weather Integration */}
      <div className="card">
        <h2>🌤️ Weather & Atmospheric Conditions <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={weatherGridStyle}>
          <div style={weatherStationStyle}>
            <h4>ISRO Bangalore</h4>
            <div>🌤️ Weather: Clear skies</div>
            <div>🌡️ Temperature: 28°C</div>
            <div>💨 Wind: 12 km/h NE</div>
            <div>💧 Humidity: 65%</div>
            <div>🌫️ Atmospheric Opacity: 0.12 (excellent)</div>
          </div>
          <div style={weatherStationStyle}>
            <h4>NASA Houston</h4>
            <div>⛅ Weather: Partly cloudy</div>
            <div>🌡️ Temperature: 32°C</div>
            <div>💨 Wind: 8 km/h SW</div>
            <div>💧 Humidity: 78%</div>
            <div>🌫️ Atmospheric Opacity: 0.18 (good)</div>
          </div>
          <div style={weatherStationStyle}>
            <h4>ISRO Sriharikota</h4>
            <div>🌧️ Weather: Light rain</div>
            <div>🌡️ Temperature: 26°C</div>
            <div>💨 Wind: 15 km/h SE</div>
            <div>💧 Humidity: 89%</div>
            <div>🌫️ Atmospheric Opacity: 0.34 (degraded)</div>
          </div>
        </div>
      </div>

      {/* Ground Stations */}
      <div className="card">
        <h2>🌍 Ground Stations <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={stationGridStyle}>
          {groundStations.map(station => (
            <div key={station.id} style={stationCardStyle}>
              <div style={stationHeaderStyle}>
                <h3>{station.name}</h3>
                <div style={statusIndicatorStyle(station.status)}>
                  {station.status === 'online' ? '🟢' : '🔴'} {station.status.toUpperCase()}
                </div>
              </div>
              
              <div style={stationInfoStyle}>
                <div><strong>📍 Location:</strong> {station.location}</div>
                <div><strong>🌤️ Weather:</strong> {station.weather}</div>
                <div><strong>⛰️ Elevation:</strong> {station.elevation}m</div>
                <div><strong>📡 Active Connections:</strong> {station.activeConnections}</div>
                <div style={hardwareItemStyle}>
                  <span><strong>💾 Capacity:</strong></span>
                  <div style={progressBarStyle}>
                    <div style={{...progressFillStyle, width: `${station.capacity}%`, backgroundColor: station.capacity < 80 ? '#00ff00' : station.capacity < 90 ? '#ffff00' : '#ff0000'}}></div>
                  </div>
                  <span>{station.capacity}%</span>
                </div>
              </div>
              
              <div style={stationActionsStyle}>
                <button className="btn" style={smallButtonStyle}>📊 Monitor</button>
                <button className="btn" style={smallButtonStyle}>⚙️ Configure</button>
                <button className="btn" style={smallButtonStyle}>🌤️ Weather</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const controlPanelStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginBottom: '20px'
};

const controlGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const selectStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  padding: '8px',
  borderRadius: '5px'
};

const actionButtonsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '15px',
  marginTop: '20px'
};

const emergencyButtonStyle = {
  background: 'linear-gradient(45deg, #ff0000, #ff4444)',
  fontWeight: 'bold'
};

const actionButtonStyle = {
  background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
  fontWeight: 'bold'
};

const satelliteGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const satelliteCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '10px',
  padding: '20px'
};

const satelliteHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  paddingBottom: '10px'
};

const statusIndicatorStyle = (status) => ({
  padding: '5px 10px',
  borderRadius: '15px',
  fontSize: '12px',
  fontWeight: 'bold',
  background: status === 'active' || status === 'online' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
  border: `1px solid ${status === 'active' || status === 'online' ? '#00ff00' : '#ff0000'}`
});

const parameterSectionStyle = {
  marginBottom: '15px',
  padding: '10px',
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '5px'
};

const parameterGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '8px',
  fontSize: '14px',
  marginTop: '8px'
};

const hardwareGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginTop: '8px'
};

const hardwareItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px'
};

const progressBarStyle = {
  flex: 1,
  height: '8px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  overflow: 'hidden'
};

const progressFillStyle = {
  height: '100%',
  transition: 'width 0.3s ease'
};

const priorityStyle = (priority) => ({
  marginLeft: '10px',
  padding: '2px 8px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: 'bold',
  background: priority === 'high' ? 'rgba(255, 0, 0, 0.2)' : priority === 'normal' ? 'rgba(255, 255, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
  border: `1px solid ${priority === 'high' ? '#ff0000' : priority === 'normal' ? '#ffff00' : '#00ff00'}`
});

const satelliteActionsStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '15px'
};

const smallButtonStyle = {
  padding: '8px 12px',
  fontSize: '12px'
};

const stationGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const stationCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '10px',
  padding: '20px'
};

const stationHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  paddingBottom: '10px'
};

const stationInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '14px',
  marginBottom: '15px'
};

const stationActionsStyle = {
  display: 'flex',
  gap: '10px'
};

const orbitalMechanicsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginTop: '15px'
};

const perturbationStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: '1.6'
};

const hardwareConstraintsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginTop: '15px'
};

const constraintCategoryStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: '1.6'
};

const prioritySystemStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginTop: '15px'
};

const priorityLevelStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: '1.6'
};

const weatherGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginTop: '15px'
};

const weatherStationStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: '1.6'
};

export default Satellites;