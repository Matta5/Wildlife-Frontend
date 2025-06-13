import { useEffect, useRef, useState } from 'react';

const GoogleMap = ({ latitude, longitude, title = "Observation Location" }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [mapError, setMapError] = useState(null);

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
                // Google Maps doesn't have a direct destroy method, but we can clear the div
                if (mapRef.current) {
                    mapRef.current.innerHTML = '';
                }
            }
        };
    }, [latitude, longitude]);

    const initializeMap = () => {
        if (!latitude || !longitude || !mapRef.current) return;

        try {
            const position = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

            // Create map
            const map = new window.google.maps.Map(mapRef.current, {
                center: position,
                zoom: 15,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            // Create marker
            const marker = new window.google.maps.Marker({
                position: position,
                map: map,
                title: title,
                animation: window.google.maps.Animation.DROP
            });

            // Create info window
            const infoWindow = new window.google.maps.InfoWindow({
                content: `<div class="p-2"><strong>${title}</strong><br>${latitude}, ${longitude}</div>`
            });

            // Add click listener to marker
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });

            // Store references for cleanup
            mapInstanceRef.current = map;
            markerRef.current = marker;
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Failed to initialize map. Please check your coordinates.');
        }
    };

    if (!latitude || !longitude) {
        return (
            <div className="bg-zinc-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">No location data available for this observation</p>
            </div>
        );
    }

    if (mapError) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Location</h3>
                <div className="bg-zinc-800 rounded-lg p-8 text-center border border-red-500">
                    <p className="text-red-400 mb-2">{mapError}</p>
                    <p className="text-gray-400 text-sm">Coordinates: {latitude}, {longitude}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Location</h3>
            <div 
                ref={mapRef} 
                className="w-full h-64 rounded-lg overflow-hidden border border-gray-600"
                style={{ minHeight: '256px' }}
            />
            <div className="text-sm text-gray-400">
                Coordinates: {latitude}, {longitude}
            </div>
        </div>
    );
};

export default GoogleMap; 