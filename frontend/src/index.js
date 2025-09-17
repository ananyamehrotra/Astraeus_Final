import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// ===== FLOATING STARS EFFECT =====
class FloatingStars {
  constructor() {
    this.starsContainer = null;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Create stars container
    this.starsContainer = document.createElement('div');
    this.starsContainer.className = 'stars-container';
    this.starsContainer.id = 'starsContainer';

    // Insert at the beginning of body
    document.body.insertBefore(this.starsContainer, document.body.firstChild);

    // Create initial stars
    this.createStars(120);

    // Start periodic shooting stars
    this.startShootingStars();

    // Periodically add more stars to keep it dynamic
    this.startStarMaintenance();
  }

  createStars(count = 120) {
    for (let i = 0; i < count; i++) {
      this.createStar();
    }
  }

  createStar() {
    if (!this.starsContainer) return;

    const star = document.createElement('div');
    star.className = 'star floating';

    // Random size distribution (more small stars, fewer large ones)
    const rand = Math.random();
    let size;
    if (rand < 0.6) size = 'small';
    else if (rand < 0.9) size = 'medium';
    else size = 'large';

    star.classList.add(size);

    // 20% chance for blue tint to match space theme
    if (Math.random() < 0.2) {
      star.classList.add('blue-tint');
    }

    // Random position
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';

    // Random animation delays for natural feel
    const twinkleDelay = Math.random() * 3;
    const floatDelay = Math.random() * 8;
    star.style.animationDelay = `${twinkleDelay}s, ${floatDelay}s`;

    // Random floating duration for variation
    const floatDuration = 6 + Math.random() * 4; // 6-10 seconds
    star.style.setProperty('animation-duration', `3s, ${floatDuration}s`);

    this.starsContainer.appendChild(star);
  }

  createShootingStar() {
    if (!this.starsContainer) return;

    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';

    // 30% chance for blue tint
    if (Math.random() < 0.3) {
      shootingStar.classList.add('blue-tint');
    }

    // Random starting height (upper portion of screen)
    shootingStar.style.top = Math.random() * 40 + '%';
    shootingStar.style.left = '-100px';

    // Small random delay
    shootingStar.style.animationDelay = Math.random() * 0.5 + 's';

    this.starsContainer.appendChild(shootingStar);

    // Remove after animation completes
    setTimeout(() => {
      if (shootingStar.parentNode) {
        shootingStar.parentNode.removeChild(shootingStar);
      }
    }, 3500);
  }

  startShootingStars() {
    // First shooting star after 3 seconds
    setTimeout(() => {
      this.createShootingStar();

      // Then every 8 seconds with some randomization
      setInterval(() => {
        // 70% chance to create shooting star every 8 seconds
        if (Math.random() < 0.7) {
          this.createShootingStar();
        }
      }, 8000);
    }, 3000);
  }

  startStarMaintenance() {
    // Add new stars periodically to maintain density
    setInterval(() => {
      if (this.starsContainer && this.starsContainer.querySelectorAll('.star').length < 150) {
        this.createStar();
      }
    }, 12000);

    // Occasionally create small bursts of stars
    setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 30 seconds
        for (let i = 0; i < 3; i++) {
          setTimeout(() => this.createStar(), i * 500);
        }
      }
    }, 30000);
  }
}

// Initialize floating stars
const floatingStars = new FloatingStars();

//React initialization
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);