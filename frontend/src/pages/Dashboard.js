import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1>Mission Control Dashboard</h1>

      <div className="card">
        <h2>Project Status</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={statusItemStyle}>
            <span className="status-indicator status-complete"></span>
            <strong>Sub-Phase 1.1:</strong> Digital Twin Foundation - COMPLETE ✅
          </div>
          <div style={statusItemStyle}>
            <span className="status-indicator status-progress"></span>
            <strong>Sub-Phase 1.2:</strong> Frontend Foundation - IN PROGRESS 🚧
          </div>
          <div style={statusItemStyle}>
            <span className="status-indicator status-planned"></span>
            <strong>Phase 2:</strong> Graph Neural Network - PLANNED 📋
          </div>
        </div>
      </div>

      <div className="card">
        <h2>System Overview</h2>
        <p>Project Astraeus uses a <strong>Digital Twin</strong> of satellite networks as training ground for a sophisticated <strong>Graph Neural Network + Reinforcement Learning</strong> agent.</p>

        <div style={metricsStyle}>
          <div style={metricStyle}>
            <h3>Satellites Tracked</h3>
            <div style={numberStyle}>4</div>
          </div>
          <div style={metricStyle}>
            <h3> Ground Stations</h3>
            <div style={numberStyle}>3</div>
          </div>
          <div style={metricStyle}>
            <h3>Efficiency Gain</h3>
            <div style={numberStyle}>15-25%</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={actionsStyle}>
          <button className="btn">Run Simulation</button>
          <button className="btn">View Analytics</button>
          <button className="btn">Train AI Model</button>
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

const actionsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)', // 3 equal columns
  gap: '15px',
  width: '100%'
};

export default Dashboard;