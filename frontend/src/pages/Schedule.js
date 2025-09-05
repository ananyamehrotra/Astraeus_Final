import React from 'react';

const Schedule = () => {
  const schedules = [
    { time: '14:50 - 14:56', satellite: 'ISS', station: 'ISRO Bangalore', duration: '6.0 min', elevation: '72.8°', quality: 'High' },
    { time: '00:44 - 00:49', satellite: 'ISS', station: 'ISRO Bangalore', duration: '5.0 min', elevation: '31.7°', quality: 'Medium' },
    { time: '16:23 - 16:28', satellite: 'Starlink-1234', station: 'NASA Houston', duration: '5.5 min', elevation: '45.2°', quality: 'Medium' },
    { time: '22:15 - 22:21', satellite: 'Starlink-5678', station: 'ISRO Sriharikota', duration: '6.2 min', elevation: '68.1°', quality: 'High' }
  ];

  return (
    <div>
      <h1>📅 Communication Schedule</h1>
      
      <div className="card">
        <h2>Optimization Status</h2>
        <div style={optimizationStyle}>
          <div style={algorithmStyle}>
            <h3>🔄 Current Algorithm</h3>
            <p>Basic Window Detection</p>
            <div style={efficiencyStyle}>Efficiency: 1.06%</div>
          </div>
          <div style={arrowStyle}>→</div>
          <div style={algorithmStyle}>
            <h3>🤖 AI Algorithm (Coming Soon)</h3>
            <p>GNN + Reinforcement Learning</p>
            <div style={efficiencyStyle}>Expected: 1.3-1.5%</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Communication Windows</h2>
        <p>Optimal satellite-ground station communication opportunities</p>
        
        <div style={scheduleHeaderStyle}>
          <button className="btn">🔄 Refresh Schedule</button>
          <button className="btn">🤖 Optimize with AI</button>
        </div>

        <div style={tableStyle}>
          <div style={headerStyle}>
            <div>Time Window</div>
            <div>Satellite</div>
            <div>Ground Station</div>
            <div>Duration</div>
            <div>Quality</div>
          </div>
          
          {schedules.map((schedule, index) => (
            <div key={index} style={rowStyle}>
              <div style={timeStyle}>{schedule.time}</div>
              <div>{schedule.satellite}</div>
              <div>{schedule.station}</div>
              <div>{schedule.duration}</div>
              <div>
                <span style={{
                  ...qualityBadgeStyle,
                  background: schedule.quality === 'High' ? '#4CAF50' : '#FF9800'
                }}>
                  {schedule.quality}
                </span>
                <br />
                <small style={{ color: '#aaa' }}>{schedule.elevation}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Schedule Statistics</h2>
        <div style={statsStyle}>
          <div style={statStyle}>
            <h3>Total Windows</h3>
            <div style={statNumberStyle}>8</div>
          </div>
          <div style={statStyle}>
            <h3>Total Communication Time</h3>
            <div style={statNumberStyle}>46 min</div>
          </div>
          <div style={statStyle}>
            <h3>Average Duration</h3>
            <div style={statNumberStyle}>5.8 min</div>
          </div>
          <div style={statStyle}>
            <h3>Network Efficiency</h3>
            <div style={statNumberStyle}>1.06%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const optimizationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  marginTop: '20px'
};

const algorithmStyle = {
  textAlign: 'center',
  padding: '20px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  flex: 1
};

const arrowStyle = {
  fontSize: '2rem',
  margin: '0 20px',
  color: '#667eea'
};

const efficiencyStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#667eea',
  marginTop: '10px'
};

const scheduleHeaderStyle = {
  display: 'flex',
  gap: '15px',
  marginBottom: '20px'
};

const tableStyle = {
  marginTop: '20px'
};

const headerStyle = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr',
  gap: '15px',
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  fontWeight: 'bold',
  marginBottom: '10px'
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr',
  gap: '15px',
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  marginBottom: '8px',
  alignItems: 'center'
};

const timeStyle = {
  fontWeight: 'bold',
  color: '#667eea'
};

const qualityBadgeStyle = {
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px'
};

const statsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const statStyle = {
  textAlign: 'center',
  padding: '20px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px'
};

const statNumberStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#667eea',
  marginTop: '10px'
};

export default Schedule;