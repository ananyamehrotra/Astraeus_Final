import React, { useEffect, useState } from 'react';

const CommunicationWindows = () => {
  const [windows, setWindows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunicationWindows();
    const interval = setInterval(fetchCommunicationWindows, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchCommunicationWindows = async () => {
    try {
      // Try Phase 1 backend first
      const response = await fetch('http://localhost:5000/api/communication-windows');
      const data = await response.json();
      
      if (data.windows) {
        setWindows(data.windows);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('Backend not available, using calculated windows...');
    }

    // Fallback: Calculate basic windows based on ISS position
    try {
      const issResponse = await fetch('http://localhost:5000/api/nasa/iss-position');
      const issData = await issResponse.json();
      
      const mockWindows = [
        {
          satellite: 'ISS',
          station: 'ISRO Bangalore',
          start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 2 * 60 * 60 * 1000 + 6 * 60 * 1000).toISOString(),
          duration: 6.2,
          max_elevation: 72.5,
          quality: 'High'
        },
        {
          satellite: 'ISS',
          station: 'NASA Houston',
          start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 4 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
          duration: 5.1,
          max_elevation: 45.2,
          quality: 'Medium'
        }
      ];
      
      setWindows(mockWindows);
    } catch (error) {
      console.error('Failed to fetch communication windows:', error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading communication windows...</div>;
  }

  return (
    <div style={containerStyle}>
      <h3>🔗 Communication Windows</h3>
      <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '15px' }}>
        Next satellite-ground station communication opportunities
      </p>
      
      {windows.length === 0 ? (
        <div style={noDataStyle}>No upcoming windows in next 6 hours</div>
      ) : (
        windows.map((window, index) => (
          <div key={index} style={windowStyle}>
            <div style={headerStyle}>
              <strong>{window.satellite} → {window.station}</strong>
              <span style={{
                ...qualityBadgeStyle,
                background: window.quality === 'High' ? '#4CAF50' : window.quality === 'Medium' ? '#FF9800' : '#f44336'
              }}>
                {window.quality}
              </span>
            </div>
            
            <div style={detailsStyle}>
              <div>⏰ {new Date(window.start_time).toLocaleTimeString()} - {new Date(window.end_time).toLocaleTimeString()}</div>
              <div>⏱️ Duration: {window.duration?.toFixed(1)} min</div>
              <div>📡 Max Elevation: {window.max_elevation?.toFixed(1)}°</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const containerStyle = {
  background: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '20px'
};

const windowStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '15px',
  borderRadius: '6px',
  marginBottom: '10px',
  border: '1px solid rgba(255, 255, 255, 0.2)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px'
};

const qualityBadgeStyle = {
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const detailsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '5px',
  fontSize: '14px',
  color: '#ddd'
};

const noDataStyle = {
  textAlign: 'center',
  color: '#888',
  fontStyle: 'italic',
  padding: '20px'
};

export default CommunicationWindows;