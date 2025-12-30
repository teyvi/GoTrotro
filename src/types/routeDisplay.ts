/**
 * Display types for transformed OpenTripPlanner routing data
 * These types represent the cleaned, frontend-ready structure
 */

export interface DisplayLeg {
  id: string;
  mode: 'WALK' | 'BUS' | 'TRANSIT';
  coordinates: [number, number][]; // Decoded polyline coordinates
  distance: number; // meters
  duration: number; // seconds
  
  // For transit legs (BUS, TRAM, etc.)
  routeInfo?: {
    routeNumber: string;
    routeName: string;
    routeColor: string; // hex color without #
    headsign: string;
    agency: string;
  };
  
  // Stop information
  fromStop: {
    name: string;
    coordinates: [number, number];
    departureTime?: Date;
  };
  toStop: {
    name: string;
    coordinates: [number, number];
    arrivalTime?: Date;
  };
  
  // For walk legs - turn by turn instructions
  steps?: WalkStep[];
}

export interface WalkStep {
  instruction: string; // Human-readable: "Turn left onto Main St"
  direction: 'LEFT' | 'RIGHT' | 'STRAIGHT' | 'SLIGHTLY_LEFT' | 'SLIGHTLY_RIGHT' | 'DEPART' | 'CONTINUE' | 'UTURN_LEFT' | 'UTURN_RIGHT' | 'CIRCLE_CLOCKWISE' | 'CIRCLE_COUNTERCLOCKWISE';
  absoluteDirection: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTHEAST' | 'NORTHWEST' | 'SOUTHEAST' | 'SOUTHWEST';
  streetName: string;
  distance: number; // meters
  coordinates: [number, number]; // Where this step occurs
}

export interface DisplayItinerary {
  id: string;
  totalDuration: number; // seconds
  totalDistance: number; // meters
  walkDistance: number; // meters
  walkTime: number; // seconds
  transitTime: number; // seconds
  waitingTime: number; // seconds
  transfers: number;
  legs: DisplayLeg[];
  startTime: Date;
  endTime: Date;
}

/**
 * Formatting utilities for display
 */
export class RouteFormatter {
  static formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  }

  static formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }

  static getModeIcon(mode: string): string {
    const icons: Record<string, string> = {
      'WALK': '🚶',
      'BUS': '🚌',
      'TRAM': '🚊',
      'RAIL': '🚆',
      'SUBWAY': '🚇',
      'FERRY': '⛴️',
      'BICYCLE': '🚲',
    };
    return icons[mode] || '🚶';
  }

  static getDirectionIcon(direction: string): string {
    const icons: Record<string, string> = {
      'LEFT': '↰',
      'RIGHT': '↱',
      'SLIGHTLY_LEFT': '↰',
      'SLIGHTLY_RIGHT': '↱',
      'CONTINUE': '↑',
      'STRAIGHT': '↑',
      'DEPART': '●',
      'UTURN_LEFT': '↶',
      'UTURN_RIGHT': '↷',
    };
    return icons[direction] || '→';
  }
}
