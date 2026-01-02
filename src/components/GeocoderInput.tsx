import React, { useRef } from "react";
import { FaLocationDot, FaRegCircle } from "react-icons/fa6";
import { useGeocoder } from "../hooks/useGeocoder";

type GeocoderInputProps = {
  placeholder: string;
  icon: "origin" | "destination";
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: any) => void;
};

const GeocoderInput: React.FC<GeocoderInputProps> = ({ placeholder, icon, value, onChange, onSelect }) => {
  const geocoderRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Use the custom hook to initialize the geocoder
  useGeocoder(geocoderRef, inputRef, onChange, onSelect);

  return (
    <div className="relative w-full sm:w-1/2">
      <input
        ref={inputRef}
        type="text"
        className="w-full min-h-[40px] sm:min-h-[44px] px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-[#AECACD] rounded hover:bg-gray-50 transition-colors duration-200 pr-8"
        readOnly
        value={value}
        placeholder={placeholder}
      />
      <div ref={geocoderRef} className="absolute top-0 left-0 w-full h-full"></div>
      {icon === "origin" ? (
        <FaRegCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 text-base sm:text-lg pointer-events-none" />
      ) : (
        <FaLocationDot className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-base sm:text-lg pointer-events-none" />
      )}
    </div>
  );
};

export default GeocoderInput;