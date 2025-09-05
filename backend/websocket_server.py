"""
Project Entanglement - Real-time WebSocket Server
Sub-Phase 1.3: Real-time Data Integration

WebSocket server for streaming live satellite positions, communication windows,
and real-time system updates to connected clients.

Features:
- Live satellite position updates (every 10 seconds)
- Real-time communication window detection
- Client subscription management
- Efficient data broadcasting
"""

from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import threading
import time
from datetime import datetime, timedelta
import json
from typing import Dict, List, Set
import logging

# Import our backend modules
from satellite_tracker import SatelliteTracker, SAMPLE_TLE_DATA, SAMPLE_GROUND_STATIONS
from communication_windows import CommunicationWindowDetector
from orbital_simulator import SatelliteConstellationSimulator
from tle_fetcher import TLEFetcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealTimeServer:
    """Real-time WebSocket server for satellite tracking"""
    
    def __init__(self):
        # Initialize Flask app with SocketIO
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'project_entanglement_2025'
        CORS(self.app)
        
        # Initialize SocketIO with threading mode (more compatible)
        self.socketio = SocketIO(
            self.app, 
            cors_allowed_origins="*",
            async_mode='threading',
            logger=False,
            engineio_logger=False
        )
        
        # Initialize backend components
        self.satellite_tracker = SatelliteTracker()
        self.window_detector = CommunicationWindowDetector(self.satellite_tracker)
        self.simulator = SatelliteConstellationSimulator()
        self.tle_fetcher = TLEFetcher()
        
        # Track connected clients and their subscriptions
        self.connected_clients: Set[str] = set()
        self.satellite_subscribers: Set[str] = set()
        self.window_subscribers: Set[str] = set()
        
        # Real-time update control
        self.update_thread = None
        self.is_running = False
        self.update_interval = 10  # seconds
        
        # Setup event handlers
        self._setup_event_handlers()
        
        logger.info("🛰️ Real-time WebSocket server initialized")
    
    def _setup_event_handlers(self):
        """Setup WebSocket event handlers"""
        
        @self.socketio.on('connect')
        def handle_connect():
            """Handle client connection"""
            client_id = request.sid
            self.connected_clients.add(client_id)
            logger.info(f"📡 Client connected: {client_id}")
            
            # Send welcome message with server status
            emit('server_status', {
                'status': 'connected',
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'message': 'Connected to Project Entanglement real-time server',
                'available_subscriptions': [
                    'satellite_positions',
                    'communication_windows',
                    'system_metrics'
                ]
            })
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            """Handle client disconnection"""
            client_id = request.sid
            self.connected_clients.discard(client_id)
            self.satellite_subscribers.discard(client_id)
            self.window_subscribers.discard(client_id)
            logger.info(f"📡 Client disconnected: {client_id}")
        
        @self.socketio.on('subscribe_satellites')
        def handle_satellite_subscription(data):
            """Subscribe client to satellite position updates"""
            client_id = request.sid
            self.satellite_subscribers.add(client_id)
            
            # Send immediate satellite data
            satellites = self._get_current_satellite_positions()
            emit('satellite_update', {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'satellites': satellites,
                'update_interval': self.update_interval
            })
            
            logger.info(f"🛰️ Client {client_id} subscribed to satellite updates")
        
        @self.socketio.on('unsubscribe_satellites')
        def handle_satellite_unsubscription():
            """Unsubscribe client from satellite updates"""
            client_id = request.sid
            self.satellite_subscribers.discard(client_id)
            logger.info(f"🛰️ Client {client_id} unsubscribed from satellite updates")
        
        @self.socketio.on('subscribe_windows')
        def handle_window_subscription(data):
            """Subscribe client to communication window updates"""
            client_id = request.sid
            self.window_subscribers.add(client_id)
            
            # Send immediate window data
            windows = self._get_current_communication_windows()
            emit('window_update', {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'windows': windows
            })
            
            logger.info(f"📡 Client {client_id} subscribed to window updates")
        
        @self.socketio.on('unsubscribe_windows')
        def handle_window_unsubscription():
            """Unsubscribe client from window updates"""
            client_id = request.sid
            self.window_subscribers.discard(client_id)
            logger.info(f"📡 Client {client_id} unsubscribed from window updates")
        
        @self.socketio.on('get_satellite_info')
        def handle_satellite_info_request(data):
            """Get detailed info for specific satellite"""
            satellite_name = data.get('satellite_name', 'ISS')
            
            try:
                # Get current position
                current_time = datetime.utcnow()
                position = self.satellite_tracker.get_satellite_position(
                    satellite_name, current_time
                )
                
                # Get trajectory for next hour
                trajectory = self.satellite_tracker.get_satellite_trajectory(
                    satellite_name, current_time, duration_hours=1
                )
                
                emit('satellite_info', {
                    'satellite_name': satellite_name,
                    'timestamp': current_time.isoformat() + 'Z',
                    'current_position': position,
                    'trajectory': trajectory[:10]  # Send first 10 points
                })
                
            except Exception as e:
                emit('error', {
                    'message': f"Error getting satellite info: {str(e)}",
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                })
        
        @self.socketio.on('request_simulation')
        def handle_simulation_request(data):
            """Run simulation and return results"""
            try:
                duration_hours = data.get('duration_hours', 1)
                current_time = datetime.utcnow()
                
                # Run simulation
                results = self.simulator.run_simulation(
                    start_time=current_time,
                    duration_hours=duration_hours
                )
                
                emit('simulation_results', {
                    'timestamp': current_time.isoformat() + 'Z',
                    'results': results,
                    'duration_hours': duration_hours
                })
                
            except Exception as e:
                emit('error', {
                    'message': f"Simulation error: {str(e)}",
                    'timestamp': datetime.utcnow().isoformat() + 'Z'
                })
    
    def _get_current_satellite_positions(self) -> List[Dict]:
        """Get current positions of all satellites"""
        satellites = []
        current_time = datetime.utcnow()
        
        for satellite_name in SAMPLE_TLE_DATA.keys():
            try:
                position = self.satellite_tracker.get_satellite_position(
                    satellite_name, current_time
                )
                satellites.append({
                    'name': satellite_name,
                    'position': position,
                    'timestamp': current_time.isoformat() + 'Z'
                })
            except Exception as e:
                logger.error(f"Error getting position for {satellite_name}: {e}")
        
        return satellites
    
    def _get_current_communication_windows(self) -> List[Dict]:
        """Get current communication windows"""
        windows = []
        current_time = datetime.utcnow()
        
        try:
            for satellite_name in list(SAMPLE_TLE_DATA.keys())[:2]:  # Limit for performance
                for station_name, station_coords in SAMPLE_GROUND_STATIONS.items():
                    window_list = self.window_detector.find_communication_windows(
                        satellite_name=satellite_name,
                        station_name=station_name,
                        start_time=current_time,
                        duration_hours=2
                    )
                    
                    for window in window_list[:3]:  # Limit to top 3
                        windows.append({
                            'satellite': satellite_name,
                            'ground_station': station_name,
                            'start_time': window.start_time.isoformat() + 'Z',
                            'end_time': window.end_time.isoformat() + 'Z',
                            'duration_minutes': window.duration_minutes,
                            'max_elevation': round(window.max_elevation_degrees, 2),
                            'quality_score': round(window.quality_score, 3)
                        })
        except Exception as e:
            logger.error(f"Error getting communication windows: {e}")
        
        return windows
    
    def _broadcast_updates(self):
        """Background thread to broadcast real-time updates"""
        logger.info("🚀 Starting real-time update broadcasting")
        
        while self.is_running:
            try:
                current_time = datetime.utcnow()
                
                # Broadcast satellite positions to subscribers
                if self.satellite_subscribers:
                    satellites = self._get_current_satellite_positions()
                    self.socketio.emit('satellite_update', {
                        'timestamp': current_time.isoformat() + 'Z',
                        'satellites': satellites,
                        'update_interval': self.update_interval
                    }, room=None)
                    logger.info(f"📡 Broadcasted positions to {len(self.satellite_subscribers)} subscribers")
                
                # Broadcast communication windows to subscribers
                if self.window_subscribers:
                    windows = self._get_current_communication_windows()
                    self.socketio.emit('window_update', {
                        'timestamp': current_time.isoformat() + 'Z',
                        'windows': windows
                    }, room=None)
                    logger.info(f"📡 Broadcasted windows to {len(self.window_subscribers)} subscribers")
                
                # System metrics broadcast
                if self.connected_clients:
                    self.socketio.emit('system_metrics', {
                        'timestamp': current_time.isoformat() + 'Z',
                        'connected_clients': len(self.connected_clients),
                        'satellite_subscribers': len(self.satellite_subscribers),
                        'window_subscribers': len(self.window_subscribers),
                        'server_uptime': time.time(),
                        'memory_usage': 'Available in production'
                    }, room=None)
                
            except Exception as e:
                logger.error(f"Error in broadcast update: {e}")
            
            # Wait for next update
            self.socketio.sleep(self.update_interval)
    
    def start_real_time_updates(self):
        """Start the real-time update broadcasting"""
        if not self.is_running:
            self.is_running = True
            self.update_thread = self.socketio.start_background_task(self._broadcast_updates)
            logger.info("✅ Real-time updates started")
    
    def stop_real_time_updates(self):
        """Stop the real-time update broadcasting"""
        self.is_running = False
        logger.info("⏹️ Real-time updates stopped")
    
    def run(self, host='0.0.0.0', port=5001, debug=False):
        """Run the WebSocket server"""
        logger.info(f"🌐 Starting WebSocket server on {host}:{port}")
        self.start_real_time_updates()
        self.socketio.run(self.app, host=host, port=port, debug=debug)


# Create global server instance
websocket_server = RealTimeServer()

if __name__ == '__main__':
    print("🛰️  Project Entanglement - Real-time WebSocket Server")
    print("📡 AI-Powered Satellite Communication Scheduler")
    print("🌍 ISRO SIH 2025 Problem Statement #25142")
    print("--------------------------------------------------")
    print("🚀 WebSocket Features:")
    print("   • Live satellite position streaming")
    print("   • Real-time communication windows")
    print("   • Client subscription management")
    print("   • System metrics broadcasting")
    print("--------------------------------------------------")
    print("🌐 WebSocket server: ws://localhost:5001")
    print("📊 Sample events: satellite_positions, communication_windows")
    print("--------------------------------------------------")
    
    # Import request for event handlers
    from flask import request
    
    try:
        websocket_server.run(host='0.0.0.0', port=5001, debug=True)
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped by user")
        websocket_server.stop_real_time_updates()
