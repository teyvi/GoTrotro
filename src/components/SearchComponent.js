import React, { useState, useEffect, useRef } from "react";
import { FaLocationDot, FaRegCircle } from "react-icons/fa6";
import { IoIosSwap } from "react-icons/io";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import "maplibre-gl/dist/maplibre-gl.css";

function SearchComponent({ onOriginSelect, onDestinationSelect, onSwapLocations }) {
  // State for origin and destination inputs
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  
  // Refs for geocoder containers
  const originGeocoderRef = useRef(null);
  const destinationGeocoderRef = useRef(null);

  // Create refs for storing selected values
  const selectedOriginRef = useRef("");
  const selectedDestinationRef = useRef("");
  
  // Use plain input refs for manual value setting
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  useEffect(() => {
    // Add custom styles to handle overlaying geocoder on inputs
    const style = document.createElement('style');
    style.innerHTML = `
      .maplibregl-ctrl-geocoder {
        box-shadow: none !important;
        background: transparent !important;
        min-width: auto !important;
        width: 100% !important;
        max-width: none !important;
        z-index: 1;
      }
      .maplibregl-ctrl-geocoder input {
        height: 40px !important;
        background: transparent !important;
        border: none !important;
        padding: 6px 30px 6px 12px !important;
      }
      .maplibregl-ctrl-geocoder--icon {
        display: none !important;
      }
      .maplibregl-ctrl-geocoder--pin-right {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Create geocoder instances only after component is mounted
    if (originGeocoderRef.current && destinationGeocoderRef.current) {
      // Define Nominatim geocoder API
      const geocoderApi = {
        forwardGeocode: async (config) => {
          const features = [];
          try {
            const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
            const response = await fetch(request);
            const geojson = await response.json();
            
            for (const feature of geojson.features) {
              const center = [
                feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
                feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
              ];
              const point = {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: center,
                },
                place_name: feature.properties.display_name,
                properties: feature.properties,
                text: feature.properties.display_name,
                place_type: ["place"],
                center,
              };
              features.push(point);
            }
          } catch (e) {
            console.error(`Failed to forwardGeocode with error: ${e}`);
          }
          return {
            features
          };
        }
      };

      // Create origin geocoder
      const originGeocoder = new MaplibreGeocoder(geocoderApi, {
        placeholder: "Select Origin",
        clearOnBlur: false,
        clearAndBlurOnEsc: false
      });
      
      // Create destination geocoder
      const destinationGeocoder = new MaplibreGeocoder(geocoderApi, {
        placeholder: "Select Destination",
        clearOnBlur: false,
        clearAndBlurOnEsc: false
      });
      
      // Add geocoders to the DOM
      originGeocoderRef.current.appendChild(originGeocoder.onAdd());
      destinationGeocoderRef.current.appendChild(destinationGeocoder.onAdd());
      
      // Add event listeners for result selection
      originGeocoder.on('result', (e) => {
        const placeName = e.result.place_name;
        setOrigin(placeName);
        selectedOriginRef.current = placeName;
        
        // Update our visible input
        if (originInputRef.current) {
          originInputRef.current.value = placeName;
        }
        
        // Ensure the geocoder input value persists
        const geocoderInput = originGeocoderRef.current.querySelector('input');
        if (geocoderInput) {
          // Set immediately and with delay to ensure it happens after MapLibre's handling
          geocoderInput.value = placeName;
          setTimeout(() => {
            geocoderInput.value = placeName;
          }, 100);
        }
        
        onOriginSelect && onOriginSelect(e.result);
      });
      
      destinationGeocoder.on('result', (e) => {
        const placeName = e.result.place_name;
        setDestination(placeName);
        selectedDestinationRef.current = placeName;
        
        // Update our visible input
        if (destinationInputRef.current) {
          destinationInputRef.current.value = placeName;
        }
        
        // Ensure the geocoder input value persists
        const geocoderInput = destinationGeocoderRef.current.querySelector('input');
        if (geocoderInput) {
          // Set immediately and with delay to ensure it happens after MapLibre's handling
          geocoderInput.value = placeName;
          setTimeout(() => {
            geocoderInput.value = placeName;
          }, 100);
        }
        
        onDestinationSelect && onDestinationSelect(e.result);
      });
      
      // Cleanup function to remove geocoders when component unmounts
      return () => {
        originGeocoder.onRemove();
        destinationGeocoder.onRemove();
        // Remove the custom styles
        const styleElement = document.querySelector('style');
        if (styleElement && styleElement.innerHTML.includes('maplibregl-ctrl-geocoder')) {
          styleElement.remove();
        }
      };
    }
  }, [onOriginSelect, onDestinationSelect]);

  const handleSwap = () => {
    // Only swap if we have both values
    if (selectedOriginRef.current && selectedDestinationRef.current) {
      // Swap the ref values
      const tempValue = selectedOriginRef.current;
      selectedOriginRef.current = selectedDestinationRef.current;
      selectedDestinationRef.current = tempValue;
      
      // Update the state
      setOrigin(selectedOriginRef.current);
      setDestination(selectedDestinationRef.current);
      
      // Update the inputs
      if (originInputRef.current && destinationInputRef.current) {
        originInputRef.current.value = selectedOriginRef.current;
        destinationInputRef.current.value = selectedDestinationRef.current;
      }
      
      // Update the geocoder inputs
      const originGeocoderInput = originGeocoderRef.current.querySelector('input');
      const destGeocoderInput = destinationGeocoderRef.current.querySelector('input');
      
      if (originGeocoderInput && destGeocoderInput) {
        originGeocoderInput.value = selectedOriginRef.current;
        destGeocoderInput.value = selectedDestinationRef.current;
      }
      
      // Notify parent component
      onSwapLocations && onSwapLocations();
    }
  };

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        {/* Origin Input */}
        <div className="relative w-full sm:w-1/2">
          <input
            ref={originInputRef}
            type="text"
            className="w-full min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#AECACD] rounded hover:bg-gray-50 transition-colors duration-200 pr-8"
            readOnly
            defaultValue={selectedOriginRef.current}
          />
          <div ref={originGeocoderRef} className="absolute top-0 left-0 w-full h-full"></div>
          <FaRegCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 text-base sm:text-lg pointer-events-none" />
        </div>

        {/* Swap Icon */}
        <div className="flex items-center justify-center">
          <button 
            onClick={handleSwap} 
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={!selectedOriginRef.current || !selectedDestinationRef.current}
          >
            <IoIosSwap className={`text-lg sm:text-xl ${(!selectedOriginRef.current || !selectedDestinationRef.current) ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Destination Input */}
        <div className="relative w-full sm:w-1/2">
          <input
            ref={destinationInputRef}
            type="text"
            className="w-full min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#AECACD] rounded hover:bg-gray-50 transition-colors duration-200 pr-8"
            readOnly
            defaultValue={selectedDestinationRef.current}
          />
          <div ref={destinationGeocoderRef} className="absolute top-0 left-0 w-full h-full"></div>
          <FaLocationDot className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-base sm:text-lg pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default SearchComponent;