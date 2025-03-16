import React, { useState } from 'react';
import MapComponent from "../components/MapComponent";
import SearchComponent from "../components/SearchComponent";
import HomeLayout from "../layouts/HomeLayout";
import '../App.css';

function Home() {
  // State for storing selected locations
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  
  // Handle origin selection
  const handleOriginSelect = (result) => {
    setOrigin(result);
  };
  
  // Handle destination selection
  const handleDestinationSelect = (result) => {
    setDestination(result);
  };
  
  // Handle swapping locations
  const handleSwapLocations = () => {
    // Only swap if both origin and destination are set
    if (origin && destination) {
      const tempOrigin = origin;
      setOrigin(destination);
      setDestination(tempOrigin);
    }
  };
  
  return (
    <HomeLayout 
      pageTitle={
        <SearchComponent 
          onOriginSelect={handleOriginSelect}
          onDestinationSelect={handleDestinationSelect}
          onSwapLocations={handleSwapLocations}
        />
      }
    >
      <MapComponent 
        origin={origin} 
        destination={destination} 
      />
    </HomeLayout>
  );
}

export default Home;