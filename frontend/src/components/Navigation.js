import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/satellites', label: 'Satellites' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/analytics', label: 'Analytics' }
  ];

  return (
    <nav style={navStyle}>
      <div style={brandStyle}>
        <span style={logoStyle}>🌟</span>
        <h2>Project Astraeus</h2>
      </div>
      <div style={linksStyle}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...linkStyle,
              ...(location.pathname === item.path ? activeLinkStyle : {})
            }}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

const navStyle = {
  background: 'rgba(0, 0, 0, 0.8)',
  padding: '1rem 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const logoStyle = {
  fontSize: '24px'
};

const linksStyle = {
  display: 'flex',
  gap: '2rem'
};

const linkStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background 0.3s'
};

const activeLinkStyle = {
  background: 'rgba(102, 126, 234, 0.3)',
  border: '1px solid rgba(102, 126, 234, 0.5)'
};

const iconStyle = {
  fontSize: '16px'
};

export default Navigation;