import React from "react";
import { IoIosSwap } from "react-icons/io";
import { useLocation } from "../hooks/useLocation";
import LocationSearchInput from "./LocationSearch";

function SearchComponent() {
  const { origin, destination, setOrigin, setDestination, swapLocations } = useLocation();


  return (
    <div className="w-full px-1 sm:px-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <LocationSearchInput
          placeholder="Select Origin"
          icon="origin"
          value={origin?.place_name || ""}
          onLocationSelect={setOrigin}
        />
        
        <div className="flex items-center justify-center">
          <button
            onClick={swapLocations}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Swap Locations"
            disabled={!origin || !destination}
          >
            <IoIosSwap
              className={`text-lg sm:text-xl ${!origin || !destination ? "text-gray-300" : "text-gray-600"}`}
            />
          </button>
        </div>
        
        <LocationSearchInput
          placeholder="Select Destination"
          icon="destination"
          value={destination?.place_name || ""}
          onLocationSelect={setDestination}
        />
      </div>
    </div>
  );
}

export default SearchComponent;