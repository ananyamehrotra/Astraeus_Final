import React, { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);


  // Listen for custom notification events
  useEffect(() => {
    const handleNotification = (event) => {
      const { type, title, message, duration = 5000 } = event.detail;
      addNotification(type, title, message, duration);
    };

    window.addEventListener('show-notification', handleNotification);
    return () => window.removeEventListener('show-notification', handleNotification);
  }, []);

  const addNotification = (type, title, message, duration) => {
    const id = Date.now() + Math.random();
    const notification = { id, type, title, message };
    
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyle = (type) => {
    const baseStyle = {
      padding: '1rem 1.5rem',
      margin: '0.5rem 0',
      borderRadius: '8px',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '350px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      animation: 'slideIn 0.3s ease-out'
    };

    const typeStyles = {
      success: { background: 'linear-gradient(135deg, #10B981, #059669)', borderLeft: '4px solid #34D399' },
      error: { background: 'linear-gradient(135deg, #EF4444, #DC2626)', borderLeft: '4px solid #F87171' },
      warning: { background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderLeft: '4px solid #FBBF24' },
      info: { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderLeft: '4px solid #60A5FA' }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const getIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  if (notifications.length === 0) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={containerStyle}>
        {notifications.map(notification => (
          <div key={notification.id} style={getNotificationStyle(notification.type)}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span style={{marginRight: '0.8rem', fontSize: '1.2rem'}}>
                {getIcon(notification.type)}
              </span>
              <div>
                <div style={{fontWeight: 'bold', fontSize: '0.95rem'}}>
                  {notification.title}
                </div>
                <div style={{fontSize: '0.85rem', opacity: 0.9}}>
                  {notification.message}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              style={closeButtonStyle}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

const containerStyle = {
  position: 'fixed',
  top: '2rem',
  right: '2rem',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0',
  marginLeft: '1rem',
  opacity: 0.7,
  transition: 'opacity 0.2s'
};

// Helper function to show notifications
export const showNotification = (type, title, message, duration = 5000) => {
  const event = new CustomEvent('show-notification', {
    detail: { type, title, message, duration }
  });
  window.dispatchEvent(event);
};

export default NotificationSystem;
=======
  const addNotification = (type, message, icon) => {
    const id = Date.now();
    const notification = { id, type, message, icon };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Expose function globally for other components
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, []);

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <span className="notification-icon">{notification.icon}</span>
          <span className="notification-message">{notification.message}</span>
        </div>
      ))}
      
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          pointer-events: none;
        }
        
        .notification {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          margin-bottom: 10px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideIn 0.5s ease-out, fadeOut 0.5s ease-in 3.5s forwards;
          min-width: 280px;
          font-weight: 500;
        }
        
        .notification-success {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.9));
          color: white;
          box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        }
        
        .notification-warning {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.9), rgba(245, 124, 0, 0.9));
          color: white;
          box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
        }
        
        .notification-error {
          background: linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(211, 47, 47, 0.9));
          color: white;
          box-shadow: 0 4px 20px rgba(244, 67, 54, 0.3);
        }
        
        .notification-info {
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(25, 118, 210, 0.9));
          color: white;
          box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3);
        }
        
        .notification-icon {
          font-size: 18px;
          animation: pulse 2s infinite;
        }
        
        .notification-message {
          flex: 1;
          font-size: 14px;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;

