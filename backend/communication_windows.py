"""
Communication Window Detection Algorithm
Sub-Phase 1.1: Calculate optimal communication windows between satellites and ground stations
"""

from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from satellite_tracker import SatelliteTracker
import numpy as np

class CommunicationWindow:
    """Represents a communication window between satellite and ground station"""
    
    def __init__(self, satellite_name: str, station_name: str, 
                 start_time: datetime, end_time: datetime, 
                 max_elevation: float, duration_minutes: float):
        self.satellite_name = satellite_name
        self.station_name = station_name
        self.start_time = start_time
        self.end_time = end_time
        self.max_elevation = max_elevation
        self.duration_minutes = duration_minutes
        
    def __repr__(self):
        return (f"CommWindow({self.satellite_name} -> {self.station_name}, "
                f"{self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}, "
                f"{self.duration_minutes:.1f}min, {self.max_elevation:.1f}°)")

class CommunicationWindowDetector:
    """Detects and calculates communication windows"""
    
    def __init__(self, satellite_tracker: SatelliteTracker):
        self.tracker = satellite_tracker
        self.min_elevation = 10.0  # Minimum elevation angle for communication
        self.min_duration_minutes = 5.0  # Minimum window duration
        
    def find_communication_windows(self, satellite_name: str, station_name: str,
                                 start_time: datetime, duration_hours: float,
                                 step_minutes: int = 1) -> List[CommunicationWindow]:
        """Find all communication windows in time period"""
        windows = []
        current_time = start_time
        end_time = start_time + timedelta(hours=duration_hours)
        
        in_window = False
        window_start = None
        window_elevations = []
        
        while current_time <= end_time:
            is_visible = self.tracker.is_satellite_visible(
                satellite_name, station_name, current_time, self.min_elevation
            )
            
            if is_visible and not in_window:
                # Window starts
                in_window = True
                window_start = current_time
                window_elevations = []
                
            if is_visible and in_window:
                # Collect elevation data during window
                elevation = self.tracker.calculate_elevation_angle(
                    satellite_name, station_name, current_time
                )
                window_elevations.append(elevation)
                
            if not is_visible and in_window:
                # Window ends
                in_window = False
                window_end = current_time - timedelta(minutes=step_minutes)
                duration = (window_end - window_start).total_seconds() / 60
                
                if duration >= self.min_duration_minutes:
                    max_elevation = max(window_elevations) if window_elevations else 0
                    window = CommunicationWindow(
                        satellite_name, station_name,
                        window_start, window_end,
                        max_elevation, duration
                    )
                    windows.append(window)
                    
            current_time += timedelta(minutes=step_minutes)
            
        # Handle case where window extends to end of period
        if in_window and window_start:
            duration = (end_time - window_start).total_seconds() / 60
            if duration >= self.min_duration_minutes:
                max_elevation = max(window_elevations) if window_elevations else 0
                window = CommunicationWindow(
                    satellite_name, station_name,
                    window_start, end_time,
                    max_elevation, duration
                )
                windows.append(window)
                
        return windows
        
    def find_all_windows(self, start_time: datetime, duration_hours: float) -> Dict[str, List[CommunicationWindow]]:
        """Find all communication windows for all satellite-station pairs"""
        all_windows = {}
        
        for sat_name in self.tracker.satellites.keys():
            for station_name in self.tracker.ground_stations.keys():
                pair_key = f"{sat_name}_{station_name}"
                windows = self.find_communication_windows(
                    sat_name, station_name, start_time, duration_hours
                )
                all_windows[pair_key] = windows
                
        return all_windows
        
    def get_window_quality_score(self, window: CommunicationWindow) -> float:
        """Calculate quality score for communication window"""
        # Score based on duration and elevation
        duration_score = min(window.duration_minutes / 15.0, 1.0)  # Normalize to 15 min max
        elevation_score = min(window.max_elevation / 90.0, 1.0)    # Normalize to 90 degrees
        
        # Weighted combination
        quality_score = (0.6 * duration_score) + (0.4 * elevation_score)
        return quality_score
        
    def filter_high_quality_windows(self, windows: List[CommunicationWindow], 
                                  min_quality: float = 0.5) -> List[CommunicationWindow]:
        """Filter windows by quality score"""
        return [w for w in windows if self.get_window_quality_score(w) >= min_quality]