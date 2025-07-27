'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import { MapPinIcon } from '@heroicons/react/24/outline';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LocationPicker({
  onLocationSelect,
  pickupAddress,
  dropoffAddress,
  pickupCoords,
  dropoffCoords,
}) {
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Store previous coordinates to prevent unnecessary recalculations
  const prevCoordsRef = useRef({ pickup: null, dropoff: null });

  const calculateDirectDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }, []);

  const toRadians = useCallback((degrees) => {
    return degrees * (Math.PI / 180);
  }, []);

  const calculateRoute = useCallback(async () => {
    if (!pickupCoords || !dropoffCoords) {
      return;
    }

    // Check if coordinates have actually changed
    const prevPickup = prevCoordsRef.current.pickup;
    const prevDropoff = prevCoordsRef.current.dropoff;

    if (
      prevPickup &&
      prevDropoff &&
      prevPickup.lat === pickupCoords.lat &&
      prevPickup.lng === pickupCoords.lng &&
      prevDropoff.lat === dropoffCoords.lat &&
      prevDropoff.lng === dropoffCoords.lng
    ) {
      // Coordinates haven't changed, no need to recalculate
      return;
    }

    setLoading(true);
    try {
      // Calculate direct distance (Haversine formula)
      const directDistance = calculateDirectDistance(
        pickupCoords.lat,
        pickupCoords.lng,
        dropoffCoords.lat,
        dropoffCoords.lng
      );

      // For demo, estimate duration based on average city speed (25 km/h)
      const estimatedDuration = Math.round((directDistance / 25) * 60);

      setDistance(directDistance);
      setDuration(estimatedDuration);

      // Create a simple straight line route for visualization
      setRouteCoordinates([
        [pickupCoords.lat, pickupCoords.lng],
        [dropoffCoords.lat, dropoffCoords.lng],
      ]);

      // Update previous coordinates
      prevCoordsRef.current = {
        pickup: { ...pickupCoords },
        dropoff: { ...dropoffCoords },
      };

      // Call callback with route information
      onLocationSelect?.({
        distance: directDistance,
        duration: estimatedDuration,
        pickupCoords,
        dropoffCoords,
      });
    } catch (error) {
      console.error('Route calculation error:', error);
    } finally {
      setLoading(false);
    }
  }, [
    pickupCoords?.lat,
    pickupCoords?.lng,
    dropoffCoords?.lat,
    dropoffCoords?.lng,
    calculateDirectDistance,
    onLocationSelect,
  ]);

  // Effect to calculate route when coordinates change
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculateRoute();
    } else {
      // Reset state when coordinates are missing
      setDistance(null);
      setDuration(null);
      setRouteCoordinates([]);
      setLoading(false);
    }
  }, [
    pickupCoords?.lat,
    pickupCoords?.lng,
    dropoffCoords?.lat,
    dropoffCoords?.lng,
    calculateRoute,
  ]);

  // Default center to Nairobi
  const defaultCenter = [-1.2921, 36.8219];

  // Calculate map center and bounds
  let mapCenter = defaultCenter;
  let mapZoom = 12;

  if (pickupCoords && dropoffCoords) {
    mapCenter = [
      (pickupCoords.lat + dropoffCoords.lat) / 2,
      (pickupCoords.lng + dropoffCoords.lng) / 2,
    ];

    // Adjust zoom based on distance
    if (distance) {
      if (distance > 50) mapZoom = 9;
      else if (distance > 20) mapZoom = 10;
      else if (distance > 10) mapZoom = 11;
      else mapZoom = 13;
    }
  } else if (pickupCoords) {
    mapCenter = [pickupCoords.lat, pickupCoords.lng];
    mapZoom = 14;
  } else if (dropoffCoords) {
    mapCenter = [dropoffCoords.lat, dropoffCoords.lng];
    mapZoom = 14;
  }

  return (
    <div className="space-y-4">
      <div className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          key={`${pickupCoords?.lat || 'no-pickup'}-${
            dropoffCoords?.lat || 'no-dropoff'
          }`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Pickup Marker */}
          {pickupCoords && (
            <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>Pickup Location</strong>
                  <br />
                  {pickupAddress}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dropoff Marker */}
          {dropoffCoords && (
            <Marker position={[dropoffCoords.lat, dropoffCoords.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>Dropoff Location</strong>
                  <br />
                  {dropoffAddress}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              color="#3B82F6"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-900 text-sm">Calculating route...</span>
          </div>
        </div>
      )}

      {distance && duration && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-blue-900">Distance: {distance} km</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-900">
                  Est. Duration: {duration} minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
