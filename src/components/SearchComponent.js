// SearchComponent.js
import React from 'react'
import '../styles/SearchBar.css'
import { FaLocationDot } from "react-icons/fa6";
import { FaRegCircle } from 'react-icons/fa';

function SearchComponent() {
  return (
    <div>
      
      <main className='search'>
        <div className='search-box'>
          <div className='search-fields'>
            <div className='origin-location'>
              <span><FaRegCircle className="origin-icon" /></span>
              Select Origin
            </div>
            <div className='destination-location'>
              <span><FaLocationDot className="destination-icon" /></span>
              Select Destination
            </div>
            <div className='swap-locations'>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SearchComponent