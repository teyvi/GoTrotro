// SearchComponent.js
import React from 'react';
import { FaLocationDot, FaRegCircle } from "react-icons/fa6";

function SearchComponent() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 p-2 md:p-3">
        <div className="flex-1 flex items-center gap-3 p-2 border-2 border-[#AECACD] rounded hover:bg-gray-50 cursor-pointer">
          <FaRegCircle className="text-blue-500 text-lg shrink-0" />
          <span className="text-gray-600 truncate">Select Origin</span>
        </div>
        
        <div className="flex-1 flex items-center gap-3 p-2 border-2 border-[#AECACD] rounded hover:bg-gray-50 cursor-pointer">
          <FaLocationDot className="text-red-500 text-lg shrink-0" />
          <span className="text-gray-600 truncate">Select Destination</span>
        </div>
      </div>
    </div>
  );
}

export default SearchComponent;