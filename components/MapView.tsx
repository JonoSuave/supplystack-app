"use client";

import React, { useEffect, useState } from 'react';

interface Location {
  id: number;
  name: string;
  vendor: string;
  address: string;
  lat: number;
  lng: number;
  price: number;
}

interface MapViewProps {
  locations: Location[];
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({ locations = [], className = '' }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your current location. Please enable location services.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  }, []);

  // In a real implementation, we would use a mapping library like Google Maps, Mapbox, or Leaflet
  // For now, we'll show a placeholder with the user's coordinates and nearby locations

  return (
    <div className={`bg-gray-100 rounded-lg overflow-hidden h-[500px] ${className}`}>
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-golden-yellow mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-600">{error}</p>
            <button 
              className="mt-4 bg-golden-yellow hover:bg-amber-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="p-4 bg-white border-b border-gray-200">
            <h3 className="font-semibold text-dark-gray">Material Locations Near You</h3>
            {userLocation && (
              <p className="text-sm text-gray-500">
                Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </p>
            )}
          </div>
          <div className="flex-grow bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-600">Map integration coming soon</p>
              <p className="text-gray-500 text-sm mt-2">
                {locations.length > 0 
                  ? `Showing ${locations.length} locations near you` 
                  : 'No locations found nearby'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
