import React, { useState } from "react";
import MapComponent from "./MapComponent";
import RouteInstructions from "./RouteInstructions";
import { DisplayItinerary } from "../types/routeDisplay";
import "./RouteView.css";

interface RouteViewProps {
  displayItinerary: DisplayItinerary | null;
  onItineraryUpdate?: (itinerary: DisplayItinerary | null) => void;
}

const RouteView: React.FC<RouteViewProps> = ({ displayItinerary, onItineraryUpdate }) => {
  const [isInstructionsCollapsed, setIsInstructionsCollapsed] = useState(false);

  return (
    <div className="route-view-container">
      {/* Map Section */}
      <div className={`map-section ${isInstructionsCollapsed ? 'full-width' : ''}`}>
        <MapComponent onItineraryChange={onItineraryUpdate} />
      </div>

      {/* Instructions Section */}
      {displayItinerary && (
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
              <RouteInstructions itinerary={displayItinerary} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteView;
