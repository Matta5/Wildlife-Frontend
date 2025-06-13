import { useEffect, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';

const CoordinatePicker = ({ latitude, longitude, onCoordinatesChange, onClear }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [mapError, setMapError] = useState(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    useEffect(() => {
        // Load Google Maps script if not already loaded
        if (!window.google) {
            const script = document.createElement('script');
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = initializeMap;
            script.onerror = () => {
                setMapError('Failed to load Google Maps. Please check your API key.');
            };
            document.head.appendChild(script);
        } else {
            initializeMap();
        }

        return () => {
            // Cleanup
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }
            if (mapInstanceRef.current) {
                if (mapRef.current) {
                    mapRef.current.innerHTML = '';
                }
            }
        };
    }, []);

    const initializeMap = () => {
        if (!mapRef.current) return;

        try {
            // Default center (you can change this to a default location)
            const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York
            const initialCenter = (latitude && longitude) 
                ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
                : defaultCenter;

            // Create map with minimal features
            const map = new window.google.maps.Map(mapRef.current, {
                center: initialCenter,
                zoom: 10,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true, // Remove default UI
                zoomControl: true, // Keep zoom control
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    },
                    {
                        featureType: "transit",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            // Add click listener to map
            map.addListener('click', (event) => {
                const position = event.latLng;
                updateMarker(position, map);
                onCoordinatesChange(position.lat(), position.lng());
            });

            // Add initial marker if coordinates are provided
            if (latitude && longitude) {
                const position = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
                updateMarker(position, map);
            }

            mapInstanceRef.current = map;
            setIsMapLoaded(true);
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Failed to initialize map.');
        }
    };

    const updateMarker = (position, map) => {
        // Remove existing marker
        if (markerRef.current) {
            markerRef.current.setMap(null);
        }

        // Create new marker
        const marker = new window.google.maps.Marker({
            position: position,
            map: map,
            draggable: true, // Allow dragging
            animation: window.google.maps.Animation.DROP
        });

        // Add drag listener
        marker.addListener('dragend', (event) => {
            const position = event.latLng;
            onCoordinatesChange(position.lat(), position.lng());
        });

        markerRef.current = marker;
    };

    const handleClearCoordinates = () => {
        if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
        }
        onClear();
    };

    if (mapError) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-300">Location (Optional)</h3>
                    <button
                        type="button"
                        onClick={handleClearCoordinates}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="bg-zinc-800 rounded-lg p-8 text-center border border-red-500">
                    <p className="text-red-400">{mapError}</p>
                    <p className="text-gray-400 text-sm mt-2">
                        You can still enter coordinates manually below.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Location (Optional)</h3>
                {(latitude || longitude) && (
                    <button
                        type="button"
                        onClick={handleClearCoordinates}
                        className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </button>
                )}
            </div>
            
            <div className="space-y-3">
                {/* Map */}
                <div 
                    ref={mapRef} 
                    className="w-full h-48 rounded-lg overflow-hidden border border-gray-600"
                    style={{ minHeight: '192px' }}
                />
                
                {/* Instructions */}
                <div className="text-xs text-gray-400 bg-zinc-800 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="font-medium">How to set location:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Click anywhere on the map to place a marker</li>
                        <li>Drag the marker to adjust the position</li>
                        <li>Or enter coordinates manually below</li>
                    </ul>
                </div>

                {/* Manual coordinate inputs */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                            Latitude
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={latitude || ''}
                            onChange={(e) => {
                                const lat = e.target.value;
                                const lng = longitude || '';
                                onCoordinatesChange(lat, lng);
                                
                                // Update marker if both coordinates are valid
                                if (lat && lng && mapInstanceRef.current) {
                                    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
                                    updateMarker(position, mapInstanceRef.current);
                                }
                            }}
                            placeholder="e.g., 40.7128"
                            className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                            Longitude
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={longitude || ''}
                            onChange={(e) => {
                                const lat = latitude || '';
                                const lng = e.target.value;
                                onCoordinatesChange(lat, lng);
                                
                                // Update marker if both coordinates are valid
                                if (lat && lng && mapInstanceRef.current) {
                                    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
                                    updateMarker(position, mapInstanceRef.current);
                                }
                            }}
                            placeholder="e.g., -74.0060"
                            className="w-full bg-zinc-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoordinatePicker; 