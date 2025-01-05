// SearchComponent.js
import React from 'react';
import { FaLocationDot, FaRegCircle } from "react-icons/fa6";

function SearchComponent() {
  return (
    <div className="w-full px-1 sm:px-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center min-h-[40px] sm:min-h-[44px] gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 
                    border-2 border-[#AECACD] rounded hover:bg-gray-50 cursor-pointer flex-1
                    transition-colors duration-200">
          <FaRegCircle className="text-blue-500 text-base sm:text-lg shrink-0" />
          <span className="text-gray-600 text-sm sm:text-base truncate">Select Origin</span>
        </div>
        
        <div className="flex items-center min-h-[40px] sm:min-h-[44px] gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 
                    border-2 border-[#AECACD] rounded hover:bg-gray-50 cursor-pointer flex-1
                    transition-colors duration-200">
          <FaLocationDot className="text-red-500 text-base sm:text-lg shrink-0" />
          <span className="text-gray-600 text-sm sm:text-base truncate">Select Destination</span>
        </div>
      </div>
    </div>
  );
}

export default SearchComponent;