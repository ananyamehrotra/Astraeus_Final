"""
Basic Orbital Mechanics Simulator
Sub-Phase 1.1: Core simulation framework for satellite constellation management
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import numpy as np
from skyfield.api import utc
from satellite_tracker import SatelliteTracker, SAMPLE_TLE_DATA, SAMPLE_GROUND_STATIONS
from communication_windows import CommunicationWindowDetector, CommunicationWindow

class SatelliteConstellationSimulator:
    """Main simulation engine for satellite constellation management"""
    
    def __init__(self):
        self.tracker = SatelliteTracker()
        self.window_detector = CommunicationWindowDetector(self.tracker)
        self.simulation_start_time = None
        self.simulation_duration_hours = 24
        
    def initialize_sample_constellation(self) -> None:
        """Initialize with sample satellite and ground station data"""
        # Add sample satellites
        for sat_name, tle_data in SAMPLE_TLE_DATA.items():
            self.tracker.add_satellite_from_tle(
                sat_name, tle_data['line1'], tle_data['line2']
            )
            
        # Add sample ground stations
        for station_name, coords in SAMPLE_GROUND_STATIONS.items():
            self.tracker.add_ground_station(
                station_name, coords['lat'], coords['lon'], coords['elevation']
            )
            
    def run_simulation(self, start_time: Optional[datetime] = None, 
                      duration_hours: float = 24) -> Dict:
        """Run complete simulation and return results"""
        if start_time is None:
            start_time = datetime.now(utc)
            
        self.simulation_start_time = start_time
        self.simulation_duration_hours = duration_hours
        
        # Calculate all communication windows
        all_windows = self.window_detector.find_all_windows(start_time, duration_hours)
        
        # Generate orbital predictions
        orbital_predictions = {}
        for sat_name in self.tracker.satellites.keys():
            orbital_predictions[sat_name] = self.tracker.predict_orbit_path(
                sat_name, start_time, duration_hours, step_minutes=10
            )
            
        # Calculate simulation statistics
        stats = self._calculate_simulation_stats(all_windows)
        
        return {
            'simulation_info': {
                'start_time': start_time,
                'duration_hours': duration_hours,
                'satellites': list(self.tracker.satellites.keys()),
                'ground_stations': list(self.tracker.ground_stations.keys())
            },
            'communication_windows': all_windows,
            'orbital_predictions': orbital_predictions,
            'statistics': stats
        }
        
    def _calculate_simulation_stats(self, all_windows: Dict[str, List[CommunicationWindow]]) -> Dict:
        """Calculate simulation statistics"""
        total_windows = sum(len(windows) for windows in all_windows.values())
        total_duration = sum(
            sum(w.duration_minutes for w in windows) 
            for windows in all_windows.values()
        )
        
        if total_windows > 0:
            avg_window_duration = total_duration / total_windows
            avg_elevation = np.mean([
                w.max_elevation 
                for windows in all_windows.values() 
                for w in windows
            ])
        else:
            avg_window_duration = 0
            avg_elevation = 0
            
        return {
            'total_communication_windows': total_windows,
            'total_communication_time_minutes': total_duration,
            'average_window_duration_minutes': avg_window_duration,
            'average_max_elevation_degrees': avg_elevation,
            'coverage_efficiency': self._calculate_coverage_efficiency(all_windows)
        }
        
    def _calculate_coverage_efficiency(self, all_windows: Dict[str, List[CommunicationWindow]]) -> float:
        """Calculate network coverage efficiency percentage"""
        if not all_windows:
            return 0.0
            
        total_possible_time = self.simulation_duration_hours * 60  # minutes
        total_communication_time = sum(
            sum(w.duration_minutes for w in windows) 
            for windows in all_windows.values()
        )
        
        # Efficiency as percentage of time with communication opportunities
        efficiency = (total_communication_time / (total_possible_time * len(all_windows))) * 100
        return min(efficiency, 100.0)  # Cap at 100%
        
    def get_satellite_status(self, satellite_name: str, time: Optional[datetime] = None) -> Dict:
        """Get current status of specific satellite"""
        if time is None:
            time = datetime.now(utc)
            
        if satellite_name not in self.tracker.satellites:
            raise ValueError(f"Satellite {satellite_name} not found")
            
        position = self.tracker.get_satellite_position(satellite_name, time)
        
        # Check visibility from all ground stations
        visibility_status = {}
        for station_name in self.tracker.ground_stations.keys():
            is_visible = self.tracker.is_satellite_visible(satellite_name, station_name, time)
            elevation = self.tracker.calculate_elevation_angle(satellite_name, station_name, time)
            visibility_status[station_name] = {
                'visible': is_visible,
                'elevation_degrees': elevation
            }
            
        return {
            'satellite_name': satellite_name,
            'timestamp': time,
            'position': position,
            'ground_station_visibility': visibility_status
        }
        
    def predict_next_communication_opportunities(self, satellite_name: str, 
                                               station_name: str, 
                                               from_time: Optional[datetime] = None,
                                               look_ahead_hours: float = 48) -> List[CommunicationWindow]:
        """Predict next communication opportunities for satellite-station pair"""
        if from_time is None:
            from_time = datetime.now(utc)
            
        windows = self.window_detector.find_communication_windows(
            satellite_name, station_name, from_time, look_ahead_hours
        )
        
        # Sort by start time and return next few opportunities
        windows.sort(key=lambda w: w.start_time)
        return windows[:5]  # Return next 5 opportunities