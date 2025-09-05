"""
Project Entanglement - REST API Server
Sub-Phase 1.2: Web Interface API Layer

Flask-based REST API for satellite tracking and communication window detection.
Provides endpoints for real-time satellite data, ground station management,
and communication window optimization.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional
import traceback

# Import our backend modules
from satellite_tracker import SatelliteTracker, SAMPLE_TLE_DATA, SAMPLE_GROUND_STATIONS
from communication_windows import CommunicationWindowDetector, CommunicationWindow
from orbital_simulator import SatelliteConstellationSimulator
from tle_fetcher import TLEFetcher

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for web frontend

# Global instances
simulator = SatelliteConstellationSimulator()
tle_fetcher = TLEFetcher()

# Initialize with sample data
simulator.initialize_sample_constellation()

@app.route('/', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'Project Entanglement API',
        'version': '1.0.0',
        'message': 'AI-Powered Satellite Communication Scheduler',
        'endpoints': {
            'satellites': '/api/satellites',
            'ground_stations': '/api/ground-stations',
            'position': '/api/satellites/{name}/position',
            'windows': '/api/communication-windows',
            'simulation': '/api/simulation/run',
            'live_data': '/api/satellites/live-data'
        }
    })

# ==================== DOCUMENTATION AND TEST ROUTES ====================

@app.route('/')
def index():
    """API Documentation and Status"""
    return jsonify({
        'project': 'Project Entanglement',
        'description': 'AI-Powered Satellite Communication Scheduler',
        'organization': 'ISRO SIH 2025 Problem Statement #25142',
        'version': '1.0.0',
        'api_base': '/api',
        'websocket_server': 'ws://localhost:5001',
        'endpoints': {
            'satellites': '/api/satellites',
            'ground_stations': '/api/ground-stations',
            'communication_windows': '/api/communication-windows',
            'visibility': '/api/visibility',
            'simulation': '/api/simulation/run',
            'live_data': '/api/satellites/live-data'
        },
        'test_interface': '/websocket-test',
        'status': 'operational'
    })

@app.route('/websocket-test')
def websocket_test():
    """WebSocket Test Interface"""
    return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Entanglement - WebSocket Test</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
            color: #ffffff;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .status {
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
        }
        .connected { background-color: #2d5a27; }
        .disconnected { background-color: #5a2727; }
        .data-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .satellite-item {
            background: rgba(0, 255, 100, 0.1);
            border-left: 4px solid #00ff64;
            padding: 10px;
            margin: 5px 0;
        }
        .window-item {
            background: rgba(255, 100, 0, 0.1);
            border-left: 4px solid #ff6400;
            padding: 10px;
            margin: 5px 0;
        }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #45a049; }
        button:disabled { background: #666; cursor: not-allowed; }
        .log-item { 
            font-size: 12px; 
            padding: 5px; 
            border-bottom: 1px solid #333; 
        }
        .info-box {
            background: rgba(0, 123, 255, 0.1);
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛰️ Project Entanglement - WebSocket Test</h1>
            <p>Real-time Satellite Tracking System</p>
        </div>

        <div class="info-box">
            <h3>📡 Connection Information</h3>
            <p><strong>API Server:</strong> http://localhost:5000 (REST API)</p>
            <p><strong>WebSocket Server:</strong> ws://localhost:5001 (Real-time data)</p>
            <p><strong>Architecture:</strong> Clean separation of concerns</p>
        </div>

        <div id="connectionStatus" class="status disconnected">
            📡 Status: Disconnected
        </div>

        <div class="controls">
            <button id="connectBtn" onclick="connect()">Connect to WebSocket</button>
            <button id="disconnectBtn" onclick="disconnect()" disabled>Disconnect</button>
            <button id="subscribeSatBtn" onclick="subscribeSatellites()" disabled>Subscribe to Satellites</button>
            <button id="subscribeWinBtn" onclick="subscribeWindows()" disabled>Subscribe to Windows</button>
        </div>

        <div class="data-section">
            <h3>🛰️ Live Satellite Positions</h3>
            <div id="satelliteData">No data yet...</div>
        </div>

        <div class="data-section">
            <h3>📡 Communication Windows</h3>
            <div id="windowData">No data yet...</div>
        </div>

        <div class="data-section">
            <h3>📊 System Metrics</h3>
            <div id="metricsData">No data yet...</div>
        </div>

        <div class="data-section">
            <h3>📝 Event Log</h3>
            <div id="eventLog" style="max-height: 200px; overflow-y: auto;"></div>
        </div>
    </div>

    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <script>
        let socket = null;

        function log(message) {
            const timestamp = new Date().toLocaleTimeString();
            const logDiv = document.getElementById('eventLog');
            logDiv.innerHTML = '<div class="log-item">[' + timestamp + '] ' + message + '</div>' + logDiv.innerHTML;
            console.log('[WebSocket]', message);
        }

        function updateStatus(isConnected) {
            const statusDiv = document.getElementById('connectionStatus');
            const connectBtn = document.getElementById('connectBtn');
            const disconnectBtn = document.getElementById('disconnectBtn');
            const subscribeSatBtn = document.getElementById('subscribeSatBtn');
            const subscribeWinBtn = document.getElementById('subscribeWinBtn');

            if (isConnected) {
                statusDiv.className = 'status connected';
                statusDiv.textContent = '✅ Status: Connected to WebSocket Server';
                connectBtn.disabled = true;
                disconnectBtn.disabled = false;
                subscribeSatBtn.disabled = false;
                subscribeWinBtn.disabled = false;
            } else {
                statusDiv.className = 'status disconnected';
                statusDiv.textContent = '❌ Status: Disconnected';
                connectBtn.disabled = false;
                disconnectBtn.disabled = true;
                subscribeSatBtn.disabled = true;
                subscribeWinBtn.disabled = true;
            }
        }

        function connect() {
            log('🔄 Connecting to WebSocket server at ws://localhost:5001...');
            socket = io('http://localhost:5001');

            socket.on('connect', function() {
                log('🔗 Connected to WebSocket server successfully!');
                updateStatus(true);
            });

            socket.on('disconnect', function() {
                log('❌ Disconnected from server');
                updateStatus(false);
            });

            socket.on('connect_error', function(error) {
                log('❌ Connection error: ' + error);
                updateStatus(false);
            });

            socket.on('server_status', function(data) {
                log('📊 Server status: ' + data.message);
                log('📋 Available subscriptions: ' + data.available_subscriptions.join(', '));
            });

            socket.on('satellite_update', function(data) {
                log('🛰️ Received ' + data.satellites.length + ' satellite positions');
                
                let html = '';
                data.satellites.forEach(function(sat) {
                    const pos = sat.position;
                    html += '<div class="satellite-item">' +
                        '<strong>' + sat.name + '</strong><br>' +
                        '📍 ' + pos.latitude.toFixed(3) + '°N, ' + pos.longitude.toFixed(3) + '°E<br>' +
                        '🚀 Altitude: ' + pos.altitude_km.toFixed(1) + ' km<br>' +
                        '⏰ ' + new Date(sat.timestamp).toLocaleTimeString() +
                    '</div>';
                });
                document.getElementById('satelliteData').innerHTML = html;
            });

            socket.on('window_update', function(data) {
                log('📡 Received ' + data.windows.length + ' communication windows');
                
                let html = '';
                data.windows.forEach(function(window) {
                    html += '<div class="window-item">' +
                        '<strong>' + window.satellite + ' → ' + window.ground_station + '</strong><br>' +
                        '⏱️ Duration: ' + window.duration_minutes.toFixed(1) + ' minutes<br>' +
                        '📐 Max Elevation: ' + window.max_elevation + '°<br>' +
                        '⭐ Quality Score: ' + window.quality_score +
                    '</div>';
                });
                document.getElementById('windowData').innerHTML = html;
            });

            socket.on('system_metrics', function(data) {
                const html = 
                    '<div>👥 Connected Clients: ' + data.connected_clients + '</div>' +
                    '<div>🛰️ Satellite Subscribers: ' + data.satellite_subscribers + '</div>' +
                    '<div>📡 Window Subscribers: ' + data.window_subscribers + '</div>' +
                    '<div>⏰ Last Update: ' + new Date(data.timestamp).toLocaleTimeString() + '</div>';
                document.getElementById('metricsData').innerHTML = html;
            });

            socket.on('error', function(data) {
                log('❌ Error: ' + data.message);
            });
        }

        function disconnect() {
            if (socket) {
                socket.disconnect();
                socket = null;
                updateStatus(false);
                log('👋 Disconnected by user');
            }
        }

        function subscribeSatellites() {
            if (socket) {
                socket.emit('subscribe_satellites', {});
                log('🛰️ Subscribed to satellite position updates');
            }
        }

        function subscribeWindows() {
            if (socket) {
                socket.emit('subscribe_windows', {});
                log('📡 Subscribed to communication window updates');
            }
        }

        // Initialize
        updateStatus(false);
        log('🌐 WebSocket test interface loaded');
        log('🔧 Make sure WebSocket server is running on port 5001');
    </script>
</body>
</html>'''

# ==================== SATELLITE MANAGEMENT ENDPOINTS ====================

@app.route('/api/satellites', methods=['GET'])
def get_satellites():
    """Get list of all tracked satellites"""
    try:
        satellites = []
        for name, satellite in simulator.tracker.satellites.items():
            satellites.append({
                'name': name,
                'catalog_number': getattr(satellite, 'model', {}).get('satnum', 'N/A'),
                'added_time': datetime.now().isoformat()
            })
        
        return jsonify({
            'satellites': satellites,
            'count': len(satellites),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/satellites', methods=['POST'])
def add_satellite():
    """Add new satellite from TLE data"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'line1', 'line2']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Add satellite to tracker
        simulator.tracker.add_satellite_from_tle(
            data['name'], data['line1'], data['line2']
        )
        
        return jsonify({
            'message': f"Satellite '{data['name']}' added successfully",
            'satellite': {
                'name': data['name'],
                'line1': data['line1'],
                'line2': data['line2']
            },
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/satellites/<satellite_name>/position', methods=['GET'])
def get_satellite_position(satellite_name):
    """Get current or specific time position of satellite"""
    try:
        # Get optional time parameter
        time_str = request.args.get('time')
        if time_str:
            # Parse ISO format timestamp
            target_time = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
        else:
            target_time = datetime.utcnow()
        
        # Get satellite position
        position = simulator.tracker.get_satellite_position(satellite_name, target_time)
        
        return jsonify({
            'satellite': satellite_name,
            'position': {
                'latitude': position['latitude'],
                'longitude': position['longitude'],
                'altitude_km': position['altitude_km'],
                'time': position['time'].isoformat()
            },
            'status': 'success'
        })
        
    except ValueError as e:
        return jsonify({'error': str(e), 'status': 'error'}), 404
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/satellites/<satellite_name>/trajectory', methods=['GET'])
def get_satellite_trajectory(satellite_name):
    """Get satellite trajectory over time period"""
    try:
        # Get query parameters
        duration_hours = float(request.args.get('duration_hours', 6))
        step_minutes = int(request.args.get('step_minutes', 10))
        start_time_str = request.args.get('start_time')
        
        if start_time_str:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        else:
            start_time = datetime.utcnow()
        
        # Generate trajectory points
        trajectory = []
        current_time = start_time
        end_time = start_time + timedelta(hours=duration_hours)
        
        while current_time <= end_time:
            try:
                position = simulator.tracker.get_satellite_position(satellite_name, current_time)
                trajectory.append({
                    'time': current_time.isoformat(),
                    'latitude': position['latitude'],
                    'longitude': position['longitude'],
                    'altitude_km': position['altitude_km']
                })
            except Exception as e:
                print(f"Error calculating position at {current_time}: {e}")
                
            current_time += timedelta(minutes=step_minutes)
        
        return jsonify({
            'satellite': satellite_name,
            'trajectory': trajectory,
            'duration_hours': duration_hours,
            'step_minutes': step_minutes,
            'points_count': len(trajectory),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# ==================== GROUND STATION MANAGEMENT ENDPOINTS ====================

@app.route('/api/ground-stations', methods=['GET'])
def get_ground_stations():
    """Get list of all ground stations"""
    try:
        stations = []
        for name, station in simulator.tracker.ground_stations.items():
            stations.append({
                'name': name,
                'latitude': station.latitude.degrees,
                'longitude': station.longitude.degrees,
                'elevation_m': station.elevation.m
            })
        
        return jsonify({
            'ground_stations': stations,
            'count': len(stations),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/ground-stations', methods=['POST'])
def add_ground_station():
    """Add new ground station"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'latitude', 'longitude']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        elevation = data.get('elevation_m', 0)
        
        # Add ground station
        simulator.tracker.add_ground_station(
            data['name'], data['latitude'], data['longitude'], elevation
        )
        
        return jsonify({
            'message': f"Ground station '{data['name']}' added successfully",
            'station': {
                'name': data['name'],
                'latitude': data['latitude'],
                'longitude': data['longitude'],
                'elevation_m': elevation
            },
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# ==================== COMMUNICATION WINDOWS ENDPOINTS ====================

@app.route('/api/communication-windows', methods=['GET'])
def get_communication_windows():
    """Find communication windows between satellites and ground stations"""
    try:
        # Get query parameters
        satellite_name = request.args.get('satellite')
        station_name = request.args.get('station')
        duration_hours = float(request.args.get('duration_hours', 24))
        start_time_str = request.args.get('start_time')
        
        if start_time_str:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        else:
            start_time = datetime.utcnow()
        
        if satellite_name and station_name:
            # Find windows for specific satellite-station pair
            windows = simulator.window_detector.find_communication_windows(
                satellite_name, station_name, start_time, duration_hours
            )
        else:
            # Find all windows across all satellites and stations
            windows = simulator.window_detector.find_all_windows(start_time, duration_hours)
        
        # Convert windows to JSON-serializable format
        windows_data = []
        for window in windows:
            windows_data.append({
                'satellite': window.satellite_name,
                'station': window.station_name,
                'start_time': window.start_time.isoformat(),
                'end_time': window.end_time.isoformat(),
                'duration_minutes': window.duration_minutes,
                'max_elevation_degrees': window.max_elevation,
                'quality_score': getattr(window, 'quality_score', 0.0)
            })
        
        return jsonify({
            'windows': windows_data,
            'count': len(windows_data),
            'total_duration_minutes': sum(w.duration_minutes for w in windows),
            'search_parameters': {
                'satellite': satellite_name,
                'station': station_name,
                'start_time': start_time.isoformat(),
                'duration_hours': duration_hours
            },
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/visibility', methods=['GET'])
def check_visibility():
    """Check if satellite is currently visible from ground station"""
    try:
        satellite_name = request.args.get('satellite')
        station_name = request.args.get('station')
        time_str = request.args.get('time')
        
        if not satellite_name or not station_name:
            return jsonify({'error': 'Both satellite and station parameters required'}), 400
        
        if time_str:
            check_time = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
        else:
            check_time = datetime.utcnow()
        
        # Check visibility
        is_visible = simulator.tracker.is_satellite_visible(
            satellite_name, station_name, check_time
        )
        
        if is_visible:
            elevation = simulator.tracker.get_elevation_angle(
                satellite_name, station_name, check_time
            )
        else:
            elevation = None
        
        return jsonify({
            'satellite': satellite_name,
            'station': station_name,
            'time': check_time.isoformat(),
            'is_visible': is_visible,
            'elevation_degrees': elevation,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# ==================== SIMULATION ENDPOINTS ====================

@app.route('/api/simulation/run', methods=['POST'])
def run_simulation():
    """Run complete satellite constellation simulation"""
    try:
        data = request.get_json() or {}
        
        duration_hours = data.get('duration_hours', 24)
        start_time_str = data.get('start_time')
        
        if start_time_str:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        else:
            start_time = datetime.utcnow()
        
        # Run simulation
        results = simulator.run_simulation(start_time, duration_hours)
        
        # Convert results to JSON-serializable format
        simulation_results = {
            'start_time': start_time.isoformat(),
            'duration_hours': duration_hours,
            'summary': results.get('summary', {}),
            'windows': [],
            'orbital_predictions': results.get('orbital_predictions', {}),
            'status': 'success'
        }
        
        # Add communication windows
        if 'all_windows' in results:
            for window in results['all_windows']:
                simulation_results['windows'].append({
                    'satellite': window.satellite_name,
                    'station': window.station_name,
                    'start_time': window.start_time.isoformat(),
                    'end_time': window.end_time.isoformat(),
                    'duration_minutes': window.duration_minutes,
                    'max_elevation_degrees': window.max_elevation
                })
        
        return jsonify(simulation_results)
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# ==================== LIVE DATA ENDPOINTS ====================

@app.route('/api/satellites/live-data', methods=['POST'])
def fetch_live_satellite_data():
    """Fetch live TLE data for satellites"""
    try:
        data = request.get_json() or {}
        satellite_names = data.get('satellites', [])
        
        if not satellite_names:
            return jsonify({'error': 'No satellite names provided'}), 400
        
        # Fetch live TLE data
        live_data = {}
        for sat_name in satellite_names:
            try:
                tle_data = tle_fetcher.get_satellite_tle(sat_name)
                if tle_data:
                    live_data[sat_name] = tle_data
                    # Update tracker with fresh data
                    simulator.tracker.add_satellite_from_tle(
                        sat_name, tle_data['line1'], tle_data['line2']
                    )
            except Exception as e:
                print(f"Failed to fetch TLE for {sat_name}: {e}")
        
        return jsonify({
            'live_data': live_data,
            'updated_satellites': list(live_data.keys()),
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found', 'status': 'error'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'status': 'error'}), 500

# ==================== DEVELOPMENT SERVER ====================

if __name__ == '__main__':
    print("🛰️  Project Entanglement API Server Starting...")
    print("📡 AI-Powered Satellite Communication Scheduler")
    print("🌍 ISRO SIH 2025 Problem Statement #25142")
    print("-" * 50)
    print("✅ Backend Foundation: COMPLETE")
    print("🚧 API Layer: Starting...")
    print("📊 Available endpoints:")
    print("   • GET  /api/satellites")
    print("   • POST /api/satellites")
    print("   • GET  /api/satellites/{name}/position")
    print("   • GET  /api/satellites/{name}/trajectory")
    print("   • GET  /api/ground-stations")
    print("   • POST /api/ground-stations")
    print("   • GET  /api/communication-windows")
    print("   • GET  /api/visibility")
    print("   • POST /api/simulation/run")
    print("   • POST /api/satellites/live-data")
    print("-" * 50)
    print("🌐 Server starting on http://localhost:5000")
    print("📖 API Documentation: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
