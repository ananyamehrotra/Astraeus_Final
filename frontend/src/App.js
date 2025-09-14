import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import StarField from './components/StarField';
import NotificationSystem from './components/NotificationSystem';
import Dashboard from './pages/Dashboard';
import Satellites from './pages/Satellites';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Globe from './pages/Globe';

function App() {
  return (
    <div className="App">
      <StarField />
      <Navigation />
      <NotificationSystem />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/globe" element={<Globe />} />
          <Route path="/satellites" element={<Satellites />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;