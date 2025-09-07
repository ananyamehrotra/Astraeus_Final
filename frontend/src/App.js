import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import StarField from './components/StarField';
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
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/satellites" element={<Satellites />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/globe" element={<Globe />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;