/**
 * Transform OpenTripPlanner API responses into frontend-friendly display format
 */

import { decodePolyline } from './polylineDecoder';
import { DisplayItinerary, DisplayLeg, WalkStep } from '../types/routeDisplay';

const normalizeIdPart = (value: unknown): string =>
  String(value ?? "na")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createStableItineraryId = (otpItinerary: any, index = 0): string => {
  const firstLeg = otpItinerary?.legs?.[0];
  const lastLeg = otpItinerary?.legs?.[otpItinerary.legs.length - 1];
  const seedParts = [
    otpItinerary?.startTime,
    otpItinerary?.endTime,
    otpItinerary?.duration,
    otpItinerary?.transfers,
    firstLeg?.mode,
    firstLeg?.route || firstLeg?.routeShortName,
    lastLeg?.mode,
    index,
  ];
  return `route-${normalizeIdPart(seedParts.join("-"))}`;
};

/**
 * Transform full OTP itinerary response into DisplayItinerary
 */
export function transformOTPItinerary(otpItinerary: any, index = 0): DisplayItinerary {
  const itineraryId = createStableItineraryId(otpItinerary, index);
  return {
    id: itineraryId,
    totalDuration: otpItinerary.duration || 0,
    totalDistance: otpItinerary.walkDistance || 0,
    walkDistance: otpItinerary.walkDistance || 0,
    walkTime: otpItinerary.walkTime || 0,
    transitTime: otpItinerary.transitTime || 0,
    waitingTime: otpItinerary.waitingTime || 0,
    transfers: otpItinerary.transfers || 0,
    startTime: new Date(otpItinerary.startTime),
    endTime: new Date(otpItinerary.endTime),
    legs: Array.isArray(otpItinerary.legs) 
      ? otpItinerary.legs.map((leg: any, legIndex: number) => transformLeg(leg, itineraryId, legIndex))
      : []
  };
}

/**
 * Transform a single OTP leg into DisplayLeg
 */
function transformLeg(otpLeg: any, itineraryId: string, legIndex: number): DisplayLeg {
  // Decode geometry from polyline or fallback to from/to coordinates
  let coordinates: [number, number][] = [];
  
  if (otpLeg.legGeometry?.points) {
    try {
      coordinates = decodePolyline(otpLeg.legGeometry.points);
    } catch (error) {
      console.error('Failed to decode leg geometry:', error);
      // Fallback to simple line
      coordinates = [
        [otpLeg.from.lon, otpLeg.from.lat],
        [otpLeg.to.lon, otpLeg.to.lat]
      ];
    }
  } else {
    // No geometry provided, use straight line
    coordinates = [
      [otpLeg.from.lon, otpLeg.from.lat],
      [otpLeg.to.lon, otpLeg.to.lat]
    ];
  }
  
  const leg: DisplayLeg = {
    id: `${itineraryId}-leg-${legIndex}`,
    mode: otpLeg.mode,
    coordinates,
    distance: otpLeg.distance || 0,
    duration: otpLeg.duration || 0,
    fromStop: {
      name: otpLeg.from?.name || 'Unknown',
      coordinates: [otpLeg.from?.lon || 0, otpLeg.from?.lat || 0],
      departureTime: otpLeg.from?.departure ? new Date(otpLeg.from.departure) : undefined
    },
    toStop: {
      name: otpLeg.to?.name || 'Unknown',
      coordinates: [otpLeg.to?.lon || 0, otpLeg.to?.lat || 0],
      arrivalTime: otpLeg.to?.arrival ? new Date(otpLeg.to.arrival) : undefined
    }
  };
  
  // Add transit-specific information (for BUS, TRAM, RAIL, etc.)
  if (otpLeg.transitLeg || otpLeg.mode !== 'WALK') {
    leg.routeInfo = {
      routeNumber: otpLeg.route || otpLeg.routeShortName || otpLeg.mode,
      routeName: otpLeg.routeLongName || otpLeg.route || otpLeg.mode,
      routeColor: otpLeg.routeColor || '1779c2', // default blue color
      headsign: otpLeg.headsign || '',
      agency: otpLeg.agencyName || ''
    };
  }
  
  // Add walk steps (only for WALK legs)
  if (otpLeg.mode === 'WALK' && Array.isArray(otpLeg.steps) && otpLeg.steps.length > 0) {
    leg.steps = otpLeg.steps.map((step: any) => transformWalkStep(step));
  }
  
  return leg;
}

/**
 * Transform OTP walk step into WalkStep
 */
function transformWalkStep(otpStep: any): WalkStep {
  return {
    instruction: generateInstructionText(otpStep),
    direction: otpStep.relativeDirection || 'CONTINUE',
    absoluteDirection: otpStep.absoluteDirection || 'NORTH',
    streetName: otpStep.streetName || 'Unknown street',
    distance: otpStep.distance || 0,
    coordinates: [otpStep.lon || 0, otpStep.lat || 0]
  };
}

/**
 * Generate human-readable instruction from OTP step
 */
function generateInstructionText(step: any): string {
  const direction = step.relativeDirection;
  const street = step.streetName || 'the path';
  
  switch (direction) {
    case 'DEPART':
      return `Start on ${street}`;
    case 'LEFT':
    case 'HARD_LEFT':
      return `Turn left onto ${street}`;
    case 'RIGHT':
    case 'HARD_RIGHT':
      return `Turn right onto ${street}`;
    case 'SLIGHTLY_LEFT':
      return `Bear left onto ${street}`;
    case 'SLIGHTLY_RIGHT':
      return `Bear right onto ${street}`;
    case 'CONTINUE':
      return `Continue on ${street}`;
    case 'UTURN_LEFT':
      return `Make a U-turn left onto ${street}`;
    case 'UTURN_RIGHT':
      return `Make a U-turn right onto ${street}`;
    case 'CIRCLE_CLOCKWISE':
      return `Enter roundabout and take exit onto ${street}`;
    case 'CIRCLE_COUNTERCLOCKWISE':
      return `Enter roundabout and take exit onto ${street}`;
    case 'ELEVATOR':
      return `Take elevator`;
    default:
      return `Proceed to ${street}`;
  }
}

/**
 * Transform multiple itineraries (route options)
 */
export function transformOTPResponse(otpResponse: any): DisplayItinerary[] {
  if (!otpResponse?.plan?.itineraries) {
    return [];
  }
  
  return otpResponse.plan.itineraries.map((itinerary: any, index: number) => 
    transformOTPItinerary(itinerary, index)
  );
}
