import React from 'react';

const Satellites = () => {
  const satellites = [
    { id: 'ISS', name: 'International Space Station', altitude: '419 km', status: 'Active' },
    { id: 'STARLINK_1', name: 'Starlink-1234', altitude: '550 km', status: 'Active' },
    { id: 'STARLINK_2', name: 'Starlink-5678', altitude: '550 km', status: 'Active' },
    { id: 'STARLINK_3', name: 'Starlink-9012', altitude: '550 km', status: 'Active' }
  ];

  return (
    <div>
      <h1>🛰️ Satellite Tracking</h1>

      <div className="card">
        <h2>Live Satellite Status</h2>
        <p>Real-time tracking of satellites using NASA TLE data</p>

        <div style={tableStyle}>
          <div style={headerStyle}>
            <div>Satellite</div>
            <div>Altitude</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {satellites.map(sat => (
            <div key={sat.id} style={rowStyle}>
              <div>
                <strong>{sat.name}</strong>
                <br />
                <small style={{ color: '#aaa' }}>{sat.id}</small>
              </div>
              <div>{sat.altitude}</div>
              <div>
                <span style={statusBadgeStyle}>{sat.status}</span>
              </div>
              <div>
                <button className="btn" style={smallBtnStyle}>Track</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Ground Stations</h2>
        <div style={stationsStyle}>
          <div style={stationStyle}>
            <h3>ISRO Bangalore</h3>
            <p>Lat: 12.97°N, Lon: 77.59°E</p>
            <span style={statusBadgeStyle}>Online</span>
          </div>
          <div style={stationStyle}>
            <h3>ISRO Sriharikota</h3>
            <p>Lat: 13.72°N, Lon: 80.23°E</p>
            <span style={statusBadgeStyle}>Online</span>
          </div>
          <div style={stationStyle}>
            <h3>NASA Houston</h3>
            <p>Lat: 29.76°N, Lon: -95.37°W</p>
            <span style={statusBadgeStyle}>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const tableStyle = {
  marginTop: '20px'
};

const headerStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr',
  gap: '20px',
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  fontWeight: 'bold',
  marginBottom: '10px'
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr',
  gap: '20px',
  padding: '15px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  marginBottom: '8px',
  alignItems: 'center'
};

const statusBadgeStyle = {
  background: 'linear-gradient(45deg, #4CAF50 0%, #2E7D32 100%)',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '14px',
  border: 'none'
};

const smallBtnStyle = {
  padding: '6px 12px',
  fontSize: '14px'
};

const stationsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const stationStyle = {
  padding: '20px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  textAlign: 'center'
};

export default Satellites;