"""
Satellite Trajectory Calculator
Sub-Phase 1.1: Core simulation engine for satellite position prediction
"""

from skyfield.api import load, Topos, EarthSatellite, utc
from skyfield.timelib import Time
import numpy as np
from datetime import datetime, timedelta
from typing import List, Tuple, Dict, Optional

class SatelliteTracker:
    """Core satellite position and trajectory calculator using Skyfield"""
    
    def __init__(self):
        self.ts = load.timescale()
        self.satellites = {}
        self.ground_stations = {}
        
    def add_satellite_from_tle(self, name: str, line1: str, line2: str) -> None:
        """Add satellite from TLE (Two-Line Element) data"""
        satellite = EarthSatellite(line1, line2, name, self.ts)
        self.satellites[name] = satellite
        
    def add_ground_station(self, name: str, latitude: float, longitude: float, elevation: float = 0) -> None:
        """Add ground station with coordinates"""
        station = Topos(latitude, longitude, elevation_m=elevation)
        self.ground_stations[name] = station
        
    def get_satellite_position(self, satellite_name: str, time: datetime) -> Dict:
        """Get satellite position at specific time"""
        if satellite_name not in self.satellites:
            raise ValueError(f"Satellite {satellite_name} not found")
            
        satellite = self.satellites[satellite_name]
        # Ensure time has UTC timezone
        if time.tzinfo is None:
            time = time.replace(tzinfo=utc)
        t = self.ts.from_datetime(time)
        geocentric = satellite.at(t)
        
        # Get latitude, longitude, altitude
        subpoint = geocentric.subpoint()
        
        return {
            'time': time,
            'latitude': subpoint.latitude.degrees,
            'longitude': subpoint.longitude.degrees,
            'altitude_km': subpoint.elevation.km,
            'position_km': geocentric.position.km
        }
        
    def predict_orbit_path(self, satellite_name: str, start_time: datetime, 
                          duration_hours: float, step_minutes: int = 5) -> List[Dict]:
        """Predict satellite orbital path over time period"""
        if satellite_name not in self.satellites:
            raise ValueError(f"Satellite {satellite_name} not found")
            
        satellite = self.satellites[satellite_name]
        positions = []
        
        # Ensure start_time has UTC timezone
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=utc)
            
        current_time = start_time
        end_time = start_time + timedelta(hours=duration_hours)
        
        while current_time <= end_time:
            position = self.get_satellite_position(satellite_name, current_time)
            positions.append(position)
            current_time += timedelta(minutes=step_minutes)
            
        return positions
        
    def calculate_elevation_angle(self, satellite_name: str, station_name: str, time: datetime) -> float:
        """Calculate elevation angle of satellite from ground station"""
        if satellite_name not in self.satellites:
            raise ValueError(f"Satellite {satellite_name} not found")
        if station_name not in self.ground_stations:
            raise ValueError(f"Ground station {station_name} not found")
            
        satellite = self.satellites[satellite_name]
        station = self.ground_stations[station_name]
        
        # Ensure time has UTC timezone
        if time.tzinfo is None:
            time = time.replace(tzinfo=utc)
        t = self.ts.from_datetime(time)
        difference = satellite - station
        topocentric = difference.at(t)
        alt, az, distance = topocentric.altaz()
        
        return alt.degrees
        
    def is_satellite_visible(self, satellite_name: str, station_name: str, 
                           time: datetime, min_elevation: float = 10.0) -> bool:
        """Check if satellite is visible from ground station"""
        elevation = self.calculate_elevation_angle(satellite_name, station_name, time)
        return elevation >= min_elevation

# Dynamic TLE data fetching
def get_sample_tle_data():
    """Get current TLE data or fallback to sample"""
    try:
        from tle_fetcher import get_current_satellite_data
        current_data = get_current_satellite_data()
        if current_data:
            return current_data
    except:
        pass
    
    # Fallback sample data
    return {
        'ISS': {
            'name': 'ISS (ZARYA)',
            'line1': '1 25544U 98067A   24248.54842295  .00021107  00000+0  37436-3 0  9991',
            'line2': '2 25544  51.6393 339.2971 0002972  68.7102 291.4522 15.48919103474540'
        }
    }

SAMPLE_TLE_DATA = get_sample_tle_data()

# Sample ground stations
SAMPLE_GROUND_STATIONS = {
    'ISRO_Bangalore': {'lat': 12.9716, 'lon': 77.5946, 'elevation': 920},
    'ISRO_Sriharikota': {'lat': 13.7199, 'lon': 80.2305, 'elevation': 10},
    'NASA_Houston': {'lat': 29.5586, 'lon': -95.0890, 'elevation': 18}
}