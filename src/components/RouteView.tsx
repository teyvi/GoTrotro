import React, { useState } from "react";
import MapComponent from "./MapComponent";
import RouteInstructions from "./RouteInstructions";
import { DisplayItinerary, RouteFormatter } from "../types/routeDisplay";
import "./RouteView.css";

interface RouteViewProps {
  itineraries: DisplayItinerary[];
  selectedItineraryId: string | null;
  onItinerarySelect: (itineraryId: string) => void;
  onItinerariesUpdate?: (itineraries: DisplayItinerary[]) => void;
}

const RouteView: React.FC<RouteViewProps> = ({
  itineraries,
  selectedItineraryId,
  onItinerarySelect,
  onItinerariesUpdate,
}) => {
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);
  const selectedItinerary =
    itineraries.find((itinerary) => itinerary.id === selectedItineraryId) ??
    itineraries[0] ??
    null;

  return (
    <div className="route-view-container">
      {/* Map Section */}
      <div className={`map-section ${isInstructionsCollapsed || itineraries.length === 0 ? 'full-width' : ''}`}>
        <MapComponent
          itineraries={itineraries}
          selectedItineraryId={selectedItineraryId}
          onItinerariesChange={onItinerariesUpdate}
        />
      </div>

      {/* Instructions Section */}
      {itineraries.length > 0 && selectedItinerary && (
        <div className={`instructions-section ${isInstructionsCollapsed ? 'collapsed' : ''}`}>
          <div className="instructions-header">
            <h2 className="instructions-title">Route Details</h2>
            <button
              className="toggle-button"
              onClick={() => setIsInstructionsCollapsed(!isInstructionsCollapsed)}
              aria-label={isInstructionsCollapsed ? "Show instructions" : "Hide instructions"}
            >
              {isInstructionsCollapsed ? "↑ Show" : "↓ Hide"}
            </button>
          </div>
          
          {!isInstructionsCollapsed && (
            <div className="instructions-content">
              <div className="itinerary-list">
                {itineraries.map((itinerary) => {
                  const isSelected = itinerary.id === selectedItinerary.id;
                  return (
                    <button
                      key={itinerary.id}
                      type="button"
                      className={`itinerary-card ${isSelected ? "selected" : ""}`}
                      onClick={() => onItinerarySelect(itinerary.id)}
                    >
                      <div className="itinerary-card-top">
                        <span className="itinerary-duration">
                          {RouteFormatter.formatDuration(itinerary.totalDuration)}
                        </span>
                        <span className="itinerary-time-range">
                          {RouteFormatter.formatTime(itinerary.startTime)} - {RouteFormatter.formatTime(itinerary.endTime)}
                        </span>
                      </div>
                      <div className="itinerary-card-bottom">
                        <span>{itinerary.transfers} transfer{itinerary.transfers === 1 ? "" : "s"}</span>
                        <span>{RouteFormatter.formatDistance(itinerary.walkDistance)} walk</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <RouteInstructions itinerary={selectedItinerary} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteView;
