import React, { useState } from "react";
import RouteView from "../components/RouteView";
import { DisplayItinerary } from "../types/routeDisplay";

const RouteViewPage: React.FC = () => {
  const [displayItinerary, setDisplayItinerary] = useState<DisplayItinerary | null>(null);

  return (
    <RouteView 
      displayItinerary={displayItinerary} 
      onItineraryUpdate={setDisplayItinerary}
    />
  );
};

export default RouteViewPage;
