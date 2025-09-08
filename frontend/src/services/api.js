/**
 * API Service Layer for Project Astraeus
 * Handles REST API calls and WebSocket connections to the Digital Twin backend
 */

import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';
const WEBSOCKET_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // ==================== REST API Methods ====================

  /**
   * Get all tracked satellites
   */
  async getSatellites() {
    try {
      const response = await axios.get(`${this.baseURL}/satellites`);
      return response.data;
    } catch (error) {
      console.error('Error fetching satellites:', error);
      throw error;
    }
  }

  /**
   * Get specific satellite position
   */
  async getSatellitePosition(satelliteName) {
    try {
      const response = await axios.get(`${this.baseURL}/satellites/${satelliteName}/position`);
      return response.data;
    } catch (error) {
      console.error('Error fetching satellite position:', error);
      throw error;
    }
  }

  /**
   * Get satellite trajectory over time
   */
  async getSatelliteTrajectory(satelliteName, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/satellites/${satelliteName}/trajectory`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching satellite trajectory:', error);
      throw error;
    }
  }

  /**
   * Get communication windows
   */
  async getCommunicationWindows(params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/communication-windows`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching communication windows:', error);
      throw error;
    }
  }

  /**
   * Get all ground stations
   */
  async getGroundStations() {
    try {
      const response = await axios.get(`${this.baseURL}/ground-stations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ground stations:', error);
      throw error;
    }
  }

  /**
   * Check visibility between satellite and ground station
   */
  async checkVisibility(params) {
    try {
      const response = await axios.get(`${this.baseURL}/visibility`, { params });
      return response.data;
    } catch (error) {
      console.error('Error checking visibility:', error);
      throw error;
    }
  }

  /**
   * Run simulation
   */
  async runSimulation(params) {
    try {
      const response = await axios.post(`${this.baseURL}/simulation/run`, params);
      return response.data;
    } catch (error) {
      console.error('Error running simulation:', error);
      throw error;
    }
  }

  /**
   * Add new satellite from TLE data
   */
  async addSatellite(satelliteData) {
    try {
      const response = await axios.post(`${this.baseURL}/satellites`, satelliteData);
      return response.data;
    } catch (error) {
      console.error('Error adding satellite:', error);
      throw error;
    }
  }

  /**
   * Add new ground station
   */
  async addGroundStation(stationData) {
    try {
      const response = await axios.post(`${this.baseURL}/ground-stations`, stationData);
      return response.data;
    } catch (error) {
      console.error('Error adding ground station:', error);
      throw error;
    }
  }

  // ==================== WebSocket Methods ====================

  /**
   * Connect to WebSocket for real-time updates
   */
  connectWebSocket() {
    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to Socket.IO server:', WEBSOCKET_URL);
        this.socket = io(WEBSOCKET_URL, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
        });
        
        this.socket.on('connect', () => {
          console.log('✅ Socket.IO connected successfully');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔴 Socket.IO disconnected:', reason);
          if (reason === 'io server disconnect') {
            // Server disconnected, attempt to reconnect
            this.attemptReconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.IO connection error:', error);
          reject(error);
        });

        // Listen for all possible events from backend
        this.socket.on('satellite_positions', (data) => {
          this.handleSocketMessage('satellite_positions', data);
        });

        this.socket.on('satellite_update', (data) => {
          this.handleSocketMessage('satellite_update', data);
        });

        this.socket.on('communication_windows', (data) => {
          this.handleSocketMessage('communication_windows', data);
        });

        this.socket.on('window_update', (data) => {
          this.handleSocketMessage('window_update', data);
        });

        this.socket.on('server_status', (data) => {
          this.handleSocketMessage('server_status', data);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect Socket.IO
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectWebSocket().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Handle incoming Socket.IO messages
   */
  handleSocketMessage(event, data) {
    console.log('📡 Socket.IO message received:', event, data);
    
    if (this.callbacks && this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in Socket.IO callback:', error);
        }
      });
    }
  }

  /**
   * Subscribe to real-time satellite positions
   */
  subscribeToSatellites(callback) {
    this.addCallback('satellite_positions', callback);
    this.addCallback('satellite_update', callback);
    
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe_satellites');
    }
  }

  /**
   * Subscribe to communication windows updates
   */
  subscribeToWindows(callback) {
    this.addCallback('communication_windows', callback);
    this.addCallback('window_update', callback);
    
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe_windows');
    }
  }

  /**
   * Subscribe to server status updates
   */
  subscribeToStatus(callback) {
    this.addCallback('server_status', callback);
    this.addCallback('status_update', callback);
  }

  /**
   * Add callback for specific Socket.IO event
   */
  addCallback(event, callback) {
    if (!this.callbacks) {
      this.callbacks = {};
    }
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  /**
   * Remove callback for specific Socket.IO event
   */
  removeCallback(event, callback) {
    if (this.callbacks && this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Send message via Socket.IO
   */
  sendSocketMessage(event, data = {}) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
      console.log('📤 Socket.IO message sent:', { event, data });
    } else {
      console.warn('⚠️ Socket.IO not connected, cannot send message:', { event, data });
    }
  }

  /**
   * Disconnect Socket.IO
   */
  disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.callbacks = {};
      console.log('🔌 Socket.IO disconnected manually');
    }
  }

  /**
   * Get Socket.IO connection status
   */
  isWebSocketConnected() {
    return this.socket && this.socket.connected;
  }
}

// Export singleton instance
export default new ApiService();
