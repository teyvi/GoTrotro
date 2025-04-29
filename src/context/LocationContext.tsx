import React, { createContext, useState } from 'react';
import { LocationResult } from '../types/mapTypes';
import { LocationContextType } from '../types/mapTypes';



const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [origin, setOrigin] = useState<LocationResult | null>(null);
  const [destination, setDestination] = useState<LocationResult | null>(null);

  const swapLocations = () => {
    if (origin && destination) {
      setOrigin(destination);
      setDestination(origin);
    }
  };

  return (
    <LocationContext.Provider value={{ 
      origin, 
      destination, 
      setOrigin, 
      setDestination, 
      swapLocations 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;

