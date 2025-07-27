'use client';

import { useState, useRef } from 'react';
import { Input } from './FormInput';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AddressSearch({
  label,
  placeholder,
  value,
  onChange,
  onLocationSelect,
  error,
  name,
  required = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim API for geocoding (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query + ', Kenya')}&` +
          `format=json&` +
          `limit=5&` +
          `countrycodes=ke&` +
          `addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = data.map((item) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          place_id: item.place_id,
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    onChange(e);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search requests
    timeoutRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    // Update the input value
    onChange({
      target: {
        name: name,
        value: suggestion.display_name,
      },
    });

    // Call the location select callback
    onLocationSelect?.(suggestion.lat, suggestion.lng, suggestion.display_name);

    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          label={label}
          name={name}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          error={error}
          placeholder={placeholder}
          required={required}
        />
        <div className="absolute inset-y-0 top-6 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{ zIndex: 9999 }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.display_name.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions &&
        !loading &&
        suggestions.length === 0 &&
        value.length >= 3 && (
          <div
            className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="text-sm text-gray-500 text-center">
              No locations found. Try a different search term.
            </div>
          </div>
        )}
    </div>
  );
}
