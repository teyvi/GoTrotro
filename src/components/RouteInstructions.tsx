import React, { useState } from 'react';
import { DisplayItinerary, DisplayLeg, RouteFormatter } from '../types/routeDisplay';
import './RouteInstructions.css';

interface RouteInstructionsProps {
  itinerary: DisplayItinerary;
  onLegClick?: (leg: DisplayLeg, index: number) => void;
}

export const RouteInstructions: React.FC<RouteInstructionsProps> = ({ 
  itinerary, 
  onLegClick 
}) => {
  return (
    <div className="route-instructions">
      <RouteSummary itinerary={itinerary} />
      <LegsList legs={itinerary.legs} onLegClick={onLegClick} />
    </div>
  );
};

/**
 * Summary section showing total time, transfers, arrival time
 */
const RouteSummary: React.FC<{ itinerary: DisplayItinerary }> = ({ itinerary }) => {
  return (
    <div className="route-summary">
      <h3>
        {RouteFormatter.formatDuration(itinerary.totalDuration)}
        {itinerary.transfers > 0 && (
          <span className="transfers">
            {' • '}{itinerary.transfers} transfer{itinerary.transfers > 1 ? 's' : ''}
          </span>
        )}
      </h3>
      <p className="arrival-time">
        Arrive by {RouteFormatter.formatTime(itinerary.endTime)}
      </p>
      <div className="route-stats">
        <span>🚶 {RouteFormatter.formatDistance(itinerary.walkDistance)} walk</span>
        {itinerary.transitTime > 0 && (
          <span>🚌 {RouteFormatter.formatDuration(itinerary.transitTime)} transit</span>
        )}
      </div>
    </div>
  );
};

/**
 * List of all legs in the journey
 */
const LegsList: React.FC<{ 
  legs: DisplayLeg[]; 
  onLegClick?: (leg: DisplayLeg, index: number) => void;
}> = ({ legs, onLegClick }) => {
  return (
    <div className="legs-list">
      {legs.map((leg, index) => (
        <LegCard 
          key={leg.id} 
          leg={leg} 
          stepNumber={index + 1}
          onClick={() => onLegClick?.(leg, index)}
        />
      ))}
    </div>
  );
};

/**
 * Individual leg card (walk or transit)
 */
const LegCard: React.FC<{ 
  leg: DisplayLeg; 
  stepNumber: number;
  onClick?: () => void;
}> = ({ leg, stepNumber, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleClick = () => {
    setExpanded(!expanded);
    onClick?.();
  };
  
  if (leg.mode === 'WALK') {
    return (
      <div className="leg-card walk-leg" onClick={handleClick}>
        <div className="leg-header">
          <span className="leg-number">{stepNumber}</span>
          <span className="leg-icon">{RouteFormatter.getModeIcon('WALK')}</span>
          <div className="leg-title">
            <div>Walk {RouteFormatter.formatDistance(leg.distance)}</div>
            <div className="leg-subtitle">
              {RouteFormatter.formatDuration(leg.duration)}
            </div>
          </div>
        </div>
        
        {expanded && leg.steps && leg.steps.length > 0 && (
          <WalkSteps steps={leg.steps} />
        )}
      </div>
    );
  }
  
  // Transit leg (BUS, etc.)
  return (
    <div className="leg-card transit-leg" onClick={handleClick}>
      <div className="leg-header">
        <span className="leg-number">{stepNumber}</span>
        <span className="leg-icon">{RouteFormatter.getModeIcon(leg.mode)}</span>
        <div className="leg-title">
          <div className="route-info">
            <span 
              className="route-badge" 
              style={{ backgroundColor: `#${leg.routeInfo?.routeColor}` }}
            >
              {leg.routeInfo?.routeNumber}
            </span>
            <span className="route-name">{leg.routeInfo?.routeName}</span>
          </div>
        </div>
      </div>
      
      {expanded && <TransitDetails leg={leg} />}
    </div>
  );
};

/**
 * Walk steps (turn-by-turn)
 */
const WalkSteps: React.FC<{ steps: any[] }> = ({ steps }) => {
  return (
    <div className="walk-steps">
      {steps.map((step, i) => (
        <div key={i} className="walk-step">
          <span className="step-icon">
            {RouteFormatter.getDirectionIcon(step.direction)}
          </span>
          <div className="step-content">
            <div className="step-instruction">{step.instruction}</div>
            <div className="step-distance">
              {RouteFormatter.formatDistance(step.distance)}
            </div>
          </div>
          <div className="leg-subtitle">
            {leg.routeInfo?.headsign && `→ ${leg.routeInfo.headsign}`}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Transit leg details (stops, times, distance)
 */
const TransitDetails: React.FC<{ leg: DisplayLeg }> = ({ leg }) => {
  return (
    <div className="transit-details">
      <div className="stop-info board-stop">
        <div className="stop-label">Board</div>
        <div className="stop-name">{leg.fromStop.name}</div>
        {leg.fromStop.departureTime && (
          <div className="stop-time">
            {RouteFormatter.formatTime(leg.fromStop.departureTime)}
          </div>
        )}
      </div>
      
      <div className="transit-journey">
        <div className="journey-line"></div>
        <div className="journey-info">
          {RouteFormatter.formatDuration(leg.duration)} • {RouteFormatter.formatDistance(leg.distance)}
        </div>
      </div>
      
      <div className="stop-info alight-stop">
        <div className="stop-label">Alight</div>
        <div className="stop-name">{leg.toStop.name}</div>
        {leg.toStop.arrivalTime && (
          <div className="stop-time">
            {RouteFormatter.formatTime(leg.toStop.arrivalTime)}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteInstructions;
