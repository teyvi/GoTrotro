import React, { useState } from "react";
import { IoIosSwap } from "react-icons/io";
import GeocoderInput from "./GeocoderInput";
import { SearchComponentProps } from "../types/mapTypes";

function SearchComponent({ onOriginSelect, onDestinationSelect, onSwapLocations }: SearchComponentProps) {
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");

  const handleSwap = () => {
    if (origin && destination) {
      setOrigin(destination);
      setDestination(origin);

      onSwapLocations && onSwapLocations();
    }
  };

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <GeocoderInput
          placeholder="Select Origin"
          icon="origin"
          value={origin}
          onChange={setOrigin}
          onSelect={onOriginSelect}
        />
        <div className="flex items-center justify-center">
          <button
            onClick={handleSwap}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Swap Locations"
            disabled={!origin || !destination}
          >
            <IoIosSwap
              className={`text-lg sm:text-xl ${!origin || !destination ? "text-gray-300" : "text-gray-600"}`}
            />
          </button>
        </div>
        <GeocoderInput
          placeholder="Select Destination"
          icon="destination"
          value={destination}
          onChange={setDestination}
          onSelect={onDestinationSelect}
        />
      </div>
    </div>
  );
}

export default SearchComponent;