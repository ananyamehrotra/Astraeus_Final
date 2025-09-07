import React, { useEffect, useRef, useState } from 'react';

const StarField = () => {
  const canvasRef = useRef(null);
  const [selectedStar, setSelectedStar] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Real star names and info
    const starData = [
      { name: 'Sirius', info: 'Brightest star in night sky, 8.6 light-years away' },
      { name: 'Vega', info: 'Former pole star, 25 light-years away' },
      { name: 'Arcturus', info: 'Orange giant, 37 light-years away' },
      { name: 'Rigel', info: 'Blue supergiant in Orion, 860 light-years away' },
      { name: 'Betelgeuse', info: 'Red supergiant, may explode as supernova' },
      { name: 'Aldebaran', info: 'Red giant in Taurus, 65 light-years away' },
      { name: 'Spica', info: 'Binary star system in Virgo' },
      { name: 'Antares', info: 'Red supergiant in Scorpius' },
      { name: 'Pollux', info: 'Orange giant in Gemini' },
      { name: 'Fomalhaut', info: 'Lonely star in Piscis Austrinus' }
    ];
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Star properties
    const stars = [];
    const numStars = 50;
    
    // Create stars with real names
    for (let i = 0; i < numStars; i++) {
      const starInfo = starData[i % starData.length];
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: ['#ffffff', '#ffd700', '#48dbfb', '#ff6b6b'][Math.floor(Math.random() * 4)],
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        name: starInfo.name + (i >= starData.length ? ` ${Math.floor(i/starData.length) + 1}` : ''),
        info: starInfo.info
      });
    }
    
    // Mouse interaction
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedStar = stars.find(star => {
        const distance = Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2);
        return distance <= star.size + 10;
      });
      
      if (clickedStar) {
        if (e.ctrlKey) {
          setSelectedStar(clickedStar);
          setShowInfo(true);
        } else if (e.detail === 2) { // Double click
          setSelectedStar(clickedStar);
          setShowInfo(false);
        }
      } else {
        setSelectedStar(null);
        setShowInfo(false);
      }
    };
    
    canvas.addEventListener('click', handleClick);
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Movement
        star.x += star.vx;
        star.y += star.vy;
        
        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
        
        // Twinkling effect
        star.brightness += star.twinkleSpeed;
        if (star.brightness > 1 || star.brightness < 0.3) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.brightness;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          cursor: 'crosshair'
        }}
      />
      {selectedStar && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #ffd700',
          zIndex: 1000,
          maxWidth: '300px',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>{selectedStar.name}</h3>
          {showInfo && <p style={{ margin: 0, fontSize: '14px' }}>{selectedStar.info}</p>}
          <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Double-click: Name only | Ctrl+Click: Full info
          </div>
        </div>
      )}
    </>
  );
};

export default StarField;