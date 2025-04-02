import React, { useState } from 'react';
import { FaLocationDot, FaRegCircle } from "react-icons/fa6";
import { LocationResult } from '../types/mapTypes';
import {GeocoderService} from '../services/GeocoderService';

const LocationSearchInput: React.FC<{
  placeholder: string;
  icon: "origin" | "destination";
  value: string;
  onLocationSelect: (location: LocationResult) => void;
}> = ({ placeholder, icon, value, onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  
  // Handle input changes
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.length > 2) {
      setIsSearching(true);
      const results = await GeocoderService.searchLocations(newQuery);
      setSuggestions(results);
      setIsSearching(false);
    } else {
      setSuggestions([]);
    }
  };
  
  // Handle selecting a suggestion
  const handleSelectSuggestion = (location: LocationResult) => {
    setQuery(''); // Clear the search box
    setSuggestions([]); // Clear suggestions
    onLocationSelect(location); // Pass the selection up
  };
  
  return (
    <div className="relative w-full sm:w-1/2">
      <div className="relative">
        {/* The display value (controlled by parent) */}
        {value && (
          <div className="w-full min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#AECACD] rounded bg-white flex items-center">
            {value}
          </div>
        )}
        
        {/* Search input (only shown when no value or when clicked) */}
        <input
          type="text"
          className={`w-full min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#AECACD] rounded transition-colors duration-200 pr-8 ${value ? 'hidden' : ''}`}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onClick={() => value && setQuery('')}
        />
        
        {/* Icon */}
        {icon === "origin" ? (
          <FaRegCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 text-base sm:text-lg pointer-events-none" />
        ) : (
          <FaLocationDot className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-base sm:text-lg pointer-events-none" />
        )}
      </div>
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer truncate"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion.place_name}
            </div>
          ))}
        </div>
      )}
      
      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg p-2 text-center">
          Searching...
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;