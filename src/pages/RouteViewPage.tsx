import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteView from "../components/RouteView";
import { DisplayItinerary } from "../types/routeDisplay";

const RouteViewPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [itineraries, setItineraries] = useState<DisplayItinerary[]>([]);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(
    searchParams.get("itineraryId")
  );

  const persistSelectedItineraryId = useCallback(
    (itineraryId: string | null) => {
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (itineraryId) {
          nextParams.set("itineraryId", itineraryId);
        } else {
          nextParams.delete("itineraryId");
        }
        return nextParams;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const handleItinerarySelect = useCallback(
    (itineraryId: string) => {
      setSelectedItineraryId(itineraryId);
      persistSelectedItineraryId(itineraryId);
    },
    [persistSelectedItineraryId]
  );

  const handleItinerariesUpdate = useCallback((nextItineraries: DisplayItinerary[]) => {
    setItineraries(nextItineraries);
    const itineraryIdFromUrl = searchParams.get("itineraryId");
    const nextSelectedId =
      (itineraryIdFromUrl &&
        nextItineraries.some((itinerary) => itinerary.id === itineraryIdFromUrl) &&
        itineraryIdFromUrl) ||
      (selectedItineraryId &&
        nextItineraries.some((itinerary) => itinerary.id === selectedItineraryId) &&
        selectedItineraryId) ||
      nextItineraries[0]?.id ||
      null;

    setSelectedItineraryId(nextSelectedId);
    persistSelectedItineraryId(nextSelectedId);
  }, [searchParams, selectedItineraryId, persistSelectedItineraryId]);

  useEffect(() => {
    const itineraryIdFromUrl = searchParams.get("itineraryId");
    if (!itineraryIdFromUrl) {
      return;
    }
    if (itineraries.some((itinerary) => itinerary.id === itineraryIdFromUrl) && selectedItineraryId !== itineraryIdFromUrl) {
      setSelectedItineraryId(itineraryIdFromUrl);
    }
  }, [searchParams, itineraries, selectedItineraryId]);

  return (
    <RouteView 
      itineraries={itineraries}
      selectedItineraryId={selectedItineraryId}
      onItinerarySelect={handleItinerarySelect}
      onItinerariesUpdate={handleItinerariesUpdate}
    />
  );
};

export default RouteViewPage;
