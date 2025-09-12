import React, { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

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