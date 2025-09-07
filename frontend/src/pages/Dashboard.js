import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1>🚀 Mission Control Dashboard</h1>

      {/* Performance Metrics Dashboard */}
      <div className="card">
        <h2>📊 Performance Metrics</h2>
        <div style={metricsStyle}>
          <div style={metricStyle}>
            <h3>AI Efficiency Gain <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h3>
            <div style={numberStyle}>23.4%</div>
            <small>vs Classical Algorithms</small>
          </div>
          <div style={metricStyle}>
            <h3>Network Throughput <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h3>
            <div style={numberStyle}>847 Mbps</div>
            <small>Current Data Rate</small>
          </div>
          <div style={metricStyle}>
            <h3>Satellites Active <span style={{color: '#00ff00', fontSize: '12px'}}>(R)</span></h3>
            <div style={numberStyle}>4/4</div>
            <small>All Systems Online</small>
          </div>
          <div style={metricStyle}>
            <h3>Communication Windows <span style={{color: '#00ff00', fontSize: '12px'}}>(R)</span></h3>
            <div style={numberStyle}>12</div>
            <small>Next 6 Hours</small>
          </div>
        </div>
      </div>

      {/* System Health Dashboard */}
      <div className="card">
        <h2>📶 System Health Monitor</h2>
        <div style={healthGridStyle}>
          <div style={healthItemStyle}>
            <div style={healthIndicatorStyle('#00ff00')}>•</div>
            <strong>Backend API:</strong> Connected (200ms) <span style={{color: '#00ff00', fontSize: '12px'}}>(R)</span>
          </div>
          <div style={healthItemStyle}>
            <div style={healthIndicatorStyle('#00ff00')}>•</div>
            <strong>Database:</strong> Operational (99.9% uptime) <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span>
          </div>
          <div style={healthItemStyle}>
            <div style={healthIndicatorStyle('#ffff00')}>•</div>
            <strong>AI Training:</strong> Ready (GPU Available) <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span>
          </div>
          <div style={healthItemStyle}>
            <div style={healthIndicatorStyle('#00ff00')}>•</div>
            <strong>Ground Stations:</strong> 3/3 Online <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span>
          </div>
        </div>
      </div>

      {/* AI Training Progress */}
      <div className="card">
        <h2>🤖 AI Training Monitor <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={trainingStyle}>
          <div style={progressBarContainer}>
            <div style={progressBarStyle}>Training Progress: 0% (Ready to Start)</div>
          </div>
          <div style={trainingMetricsStyle}>
            <div><strong>Episodes:</strong> 0 / 1,000,000</div>
            <div><strong>Reward:</strong> N/A</div>
            <div><strong>Learning Rate:</strong> 0.001</div>
            <div><strong>GPU Usage:</strong> 0%</div>
          </div>
        </div>
      </div>

      {/* Real-World Scenario Demo */}
      <div className="card">
        <h2>🔥 Live Crisis Scenario <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={crisisStyle}>
          <div style={crisisHeaderStyle}>
            <h3>🚨 California Wildfire Emergency</h3>
            <div style={crisisStatusStyle}>ACTIVE - Priority Override Enabled</div>
          </div>
          <div style={crisisMetricsStyle}>
            <div><strong>Earth Observation Satellites:</strong> 12 available</div>
            <div><strong>Ground Stations in Range:</strong> 4 (California, Nevada)</div>
            <div><strong>Data Backlog:</strong> 2.3 TB critical imagery</div>
            <div><strong>AI Response Time:</strong> 0.3 seconds vs 15 minutes manual</div>
          </div>
          <div style={crisisActionsStyle}>
            <button className="btn" style={emergencyButtonStyle}>🔥 Activate Wildfire Protocol</button>
            <button className="btn" style={actionButtonStyle}>📡 Prioritize Earth Observation</button>
          </div>
        </div>
      </div>

      {/* ISRO Constellation Scenario */}
      <div className="card">
        <h2>🛰️ ISRO Constellation Challenge <span style={{color: '#ff0000', fontSize: '12px'}}>(M)</span></h2>
        <div style={starlinkScenarioStyle}>
          <div style={scenarioHeaderStyle}>
            <h3>Indian Regional Navigation Satellite System (NavIC)</h3>
            <div>7 NavIC satellites + 5 Earth Observation satellites visible, only 3 ground stations available</div>
          </div>
          <div style={satelliteSelectionStyle}>
            <div style={availableSatsStyle}>
              <h4>Available ISRO Satellites (12):</h4>
              <div style={satOptionStyle(true)}>IRNSS-1A (NavIC) ✅ SELECTED</div>
              <div style={satOptionStyle(true)}>IRNSS-1B (NavIC) ✅ SELECTED</div>
              <div style={satOptionStyle(true)}>Cartosat-3 (EO) ✅ SELECTED</div>
              <div style={satOptionStyle(false)}>IRNSS-1C (NavIC) ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>IRNSS-1D (NavIC) ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>IRNSS-1E (NavIC) ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>IRNSS-1F (NavIC) ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>IRNSS-1G (NavIC) ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>RISAT-2B (Radar) ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>Resourcesat-2A ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>INSAT-3DR (Weather) ⏳ WAITING</div>
              <div style={satOptionStyle(false)}>Astrosat (Astronomy) ⏳ WAITING</div>
            </div>
            <div style={selectionMetricsStyle}>
              <h4>AI Selection Criteria:</h4>
              <div>🎯 Mission Priority: Navigation > Earth Observation > Weather</div>
              <div>⏱️ Pass Duration: >6 minutes for data download</div>
              <div>📊 Coverage Area: Indian subcontinent priority</div>
              <div>🔄 Ground Station Load: Bangalore, Sriharikota, Hassan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Control Actions */}
      <div className="card">
        <h2>🎛️ Mission Control</h2>
        <div style={controlGridStyle}>
          <button className="btn" style={actionButtonStyle}>Start AI Training</button>
          <button className="btn" style={actionButtonStyle}>Run Simulation</button>
          <button className="btn" style={actionButtonStyle}>Emergency Override</button>
          <button className="btn" style={actionButtonStyle}>Export Schedule</button>
          <button className="btn" style={actionButtonStyle}>System Diagnostics</button>
          <button className="btn" style={actionButtonStyle}>Weather Integration</button>
        </div>
      </div>

      {/* Quick Status */}
      <div className="card">
        <h2>⚡ Quick Status</h2>
        <div style={statusGridStyle}>
          <div style={statusCardStyle}>
            <h4>🛰️ Satellites <span style={{color: '#00ff00', fontSize: '10px'}}>(R)</span></h4>
            <div>ISS: 🟢 Active</div>
            <div>Hubble: 🟢 Active</div>
            <div>GPS-III: 🟢 Active</div>
            <div>Starlink: 🟢 Active</div>
          </div>
          <div style={statusCardStyle}>
            <h4>🌍 Ground Stations <span style={{color: '#ff0000', fontSize: '10px'}}>(M)</span></h4>
            <div>ISRO Bangalore: 🟢 Online</div>
            <div>ISRO Sriharikota: 🟢 Online</div>
            <div>NASA Houston: 🟢 Online</div>
          </div>
          <div style={statusCardStyle}>
            <h4>📊 Performance <span style={{color: '#ff0000', fontSize: '10px'}}>(M)</span></h4>
            <div>Latency: 45ms</div>
            <div>Success Rate: 98.7%</div>
            <div>Efficiency: +23.4%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const statusItemStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '10px 0',
  fontSize: '16px'
};

const metricsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const metricStyle = {
  textAlign: 'center',
  padding: '20px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px'
};

const numberStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#667eea',
  marginTop: '10px'
};

const healthGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '15px',
  marginTop: '15px'
};

const healthItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px'
};

const healthIndicatorStyle = (color) => ({
  color: color,
  fontSize: '20px',
  fontWeight: 'bold'
});

const trainingStyle = {
  marginTop: '15px'
};

const progressBarContainer = {
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  padding: '15px',
  marginBottom: '15px'
};

const progressBarStyle = {
  color: '#00bcd4',
  fontWeight: 'bold'
};

const trainingMetricsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px',
  fontSize: '14px'
};

const controlGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '15px',
  marginTop: '15px'
};

const actionButtonStyle = {
  padding: '15px',
  fontSize: '14px',
  fontWeight: 'bold'
};

const statusGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  marginTop: '15px'
};

const statusCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '15px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const crisisStyle = {
  background: 'rgba(255, 0, 0, 0.1)',
  border: '2px solid #ff0000',
  borderRadius: '10px',
  padding: '20px',
  marginTop: '15px'
};

const crisisHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const crisisStatusStyle = {
  background: '#ff0000',
  color: 'white',
  padding: '5px 15px',
  borderRadius: '15px',
  fontSize: '12px',
  fontWeight: 'bold',
  animation: 'pulse 2s infinite'
};

const crisisMetricsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px',
  marginBottom: '15px',
  fontSize: '14px'
};

const crisisActionsStyle = {
  display: 'flex',
  gap: '15px'
};

const emergencyButtonStyle = {
  padding: '15px',
  fontSize: '14px',
  fontWeight: 'bold',
  background: '#ff0000',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};

const starlinkScenarioStyle = {
  background: 'rgba(255, 153, 51, 0.05)',
  border: '1px solid #ff9933',
  borderRadius: '10px',
  padding: '20px',
  marginTop: '15px'
};

const scenarioHeaderStyle = {
  marginBottom: '20px',
  textAlign: 'center'
};

const satelliteSelectionStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '20px'
};

const availableSatsStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '15px',
  borderRadius: '8px',
  maxHeight: '200px',
  overflowY: 'auto'
};

const satOptionStyle = (selected) => ({
  padding: '8px',
  margin: '5px 0',
  borderRadius: '5px',
  background: selected ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${selected ? '#00ff00' : 'rgba(255, 255, 255, 0.1)'}`,
  fontSize: '12px'
});

const selectionMetricsStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '15px',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: '1.6'
};

const actionsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '15px',
  width: '100%'
};

export default Dashboard;