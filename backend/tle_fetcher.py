"""
TLE Data Fetcher - Automatic current satellite data retrieval
"""

import requests
from datetime import datetime
from typing import Dict, List
import os

class TLEFetcher:
    """Fetches current TLE data from Celestrak"""
    
    def __init__(self):
        self.base_url = "https://celestrak.org/NORAD/elements/gp.php"
        
    def fetch_iss_tle(self) -> Dict[str, str]:
        """Fetch current ISS TLE data"""
        try:
            # ISS NORAD ID is 25544
            response = requests.get(f"{self.base_url}?CATNR=25544&FORMAT=tle")
            if response.status_code == 200:
                lines = response.text.strip().split('\n')
                if len(lines) >= 3:
                    return {
                        'name': lines[0].strip(),
                        'line1': lines[1].strip(),
                        'line2': lines[2].strip()
                    }
        except Exception as e:
            print(f"Failed to fetch ISS TLE: {e}")
        
        # Fallback to recent TLE data
        return {
            'name': 'ISS (ZARYA)',
            'line1': '1 25544U 98067A   24248.54842295  .00021107  00000+0  37436-3 0  9991',
            'line2': '2 25544  51.6393 339.2971 0002972  68.7102 291.4522 15.48919103474540'
        }
        
    def fetch_starlink_sample(self) -> List[Dict[str, str]]:
        """Fetch sample Starlink satellites"""
        try:
            response = requests.get("https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle")
            if response.status_code == 200:
                lines = response.text.strip().split('\n')
                satellites = []
                
                for i in range(0, min(len(lines), 30), 3):  # First 10 satellites
                    if i + 2 < len(lines):
                        satellites.append({
                            'name': lines[i].strip(),
                            'line1': lines[i+1].strip(),
                            'line2': lines[i+2].strip()
                        })
                return satellites
        except Exception as e:
            print(f"Failed to fetch Starlink TLE: {e}")
        
        return []

def get_current_satellite_data() -> Dict[str, Dict[str, str]]:
    """Get current satellite TLE data"""
    fetcher = TLEFetcher()
    
    # Get ISS data
    iss_data = fetcher.fetch_iss_tle()
    
    # Get sample Starlink satellites
    starlink_data = fetcher.fetch_starlink_sample()
    
    satellites = {'ISS': iss_data}
    
    # Add first few Starlink satellites
    for i, sat in enumerate(starlink_data[:3]):
        satellites[f"STARLINK_{i+1}"] = sat
        
    return satellites