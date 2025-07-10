import React, { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LocationResult } from "../types/mapTypes";
import { GeocoderService } from "../services/GeocoderService";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const navigate = useNavigate();

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

  const handleSelectSuggestion = (location: LocationResult) => {
    setQuery(location.place_name);
    setSuggestions([]);
    navigate(`/routes?q=${encodeURIComponent(location.place_name)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/routes?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="w-full p-4 pl-12 rounded-full bg-gray-600 bg-opacity-80 text-white placeholder-gray-300"
            value={query}
            onChange={handleInputChange}
          />
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300"
            size={20}
          />
        </div>
      </form>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-[1000] w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-start"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="mr-3 mt-0.5">
                <MapPin size={16} className="text-red-500 flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.place_name.split(",")[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {suggestion.place_name.split(",").slice(1).join(",").trim()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Searching ....</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
