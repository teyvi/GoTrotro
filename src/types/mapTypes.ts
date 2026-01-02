export type Point = {
  longitude: number,
  latitude: number
}

export type Location = {
  coordinates: Point
  name?: string;
}

export interface RouteData {
  type: "Feature";
  properties: {};
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

export interface RoutingAdapter {
  getRoute: GetRoute
}

export type GetRoute = ((options: RoutingRequest) => Promise<Itinerary[]>)

// export interface RouteInfo {
//   distance: string; // Distance in kilometers
//   duration: string; // Duration in hours/minutes
// }

// export interface MapComponentProps {
//   origin: Location;
//   destination: Location;
//   routingEngine?: string;
// }

export type GeocoderInputProps = {
  placeholder: string;
  icon: "origin" | "destination";
  inputRef: React.Ref<HTMLInputElement>;
  geocoderRef: React.Ref<HTMLDivElement>;
  value: string;
}

// export type SearchComponentProps = {
//   onOriginSelect?: (result: any) => void;
//   onDestinationSelect?: (result: any) => void;
//   onSwapLocations?: () => void;
// };


// Define our location result type for better type safety
export type LocationResult = {
  place_name: string;
  coordinates: [number, number]; 
  properties: Record<string, any>;
  center: [number, number]
  latitude: number,
  longitude: number,
   id?: string;
};

export type LocationContextType = {
  origin: LocationResult | null;
  destination: LocationResult | null;
  setOrigin: (location: LocationResult | null) => void;
  setDestination: (location: LocationResult | null) => void;
  swapLocations: () => void;
};

// Geocoder Adapter interface for pluggable geocoding services
export interface GeocoderAdapter {
  search: (query: string, options?: GeocoderSearchOptions) => Promise<LocationResult[]>;
}

export type GeocoderSearchOptions = {
  limit?: number;
  countryCode?: string;
  language?: string;
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
};

export enum TransportationMode {
  BICYCLE,
  WALK,
  TRANSIT,
  CAR
}

export enum WindRoseDirection {
  NORTH,
  NORTHEAST,
  EAST,
  SOUTHEAST,
  SOUTH,
  SOUTHWEST,
  WEST,
  NORTHWEST,
  UNKNOWN
}

export enum BodyRelativeDirection {
  RIGHT,
  LEFT,
  FORWARD,
  BACKWARD,
  TOP,
  BOTTOM,
  START,
  END,
  UNKNOWN
}

export enum StepType {
  TURN,
  ROUNDABOUT,
  UTURN
}

export type RoutingRequest = {
  origin: Point,
  destination: Point,
  modes: TransportationMode[],
  wheelchair: boolean
}

export type Leg = {
  name: string,
  mode: TransportationMode,
  steps: Step[]
  routeLongName: string
  routeId: string,
  to: string,
  from: string,
  duration: number,
 }

export type Itinerary = {
  plan: string,
  distance: number,
  duration: number,
  startTime: Date,
  endTime: Date,
  legs: Leg[],
  geometry: [[number, number]]
} | null

export type Step = {
  name: string,
  from: Location | null,
  to: Location | null,
  windRoseDirection: WindRoseDirection | null
  bodyRelativeDirection: BodyRelativeDirection
  stepType: StepType
}

  export type RouteStep = {
    type: string;
    description: string;
    duration: string;
    line?: string;
  };

  export type RouteOption = {
    id: string;
    duration: string;
     steps: RouteStep[];
  }; 

export type RoutingResponse = {


}

export interface IOSRMEngine {
  getRoute(origin: { longitude: number; latitude: number }, destination: { longitude: number; latitude: number },
    options?: {
      arriveBy?: boolean;
      wheelChair?: boolean;
    }
  ): Promise<{
    geometry: any,
    distance: number,
    duration: number
  }>
}

export interface IValhallaEngine {
  getRoute(origin: { longitude: number; latitude: number }, destination: { longitude: number; latitude: number }, mode: string,
    options?: {
      arriveBy?: boolean;
      wheelChair?: boolean;
    }
  ): Promise<{
    geometry: any,
    distance: number,
    duration: number
  }>
}

export interface IOTPEngine {
  getRoute(origin: { longitude: number; latitude: number }, destination: { longitude: number; latitude: number },
    options?: {
      arriveBy?: boolean;
      wheelChair?: boolean;
    }
  ): Promise<{
    origin: {
      coordinates: [number, number];
      name: string;
    };
    destination: {
      coordinates: [number, number];
      name: string;
    };
    itineraries: Array<{
      duration: number;
      startTime: Date;
      endTime: Date;
      walkTime: number;
      transitTime: number;
      waitingTime: number;
      walkDistance: number;
      transfers: number;
      legs: Array<{
        mode: string;
        route: string;
        agency: string;
        from: {
          name: string;
          coordinates: [number, number];
          departureTime: Date | null;
        };
        to: {
          name: string;
          coordinates: [number, number];
          arrivalTime: Date | null;
        };
        distance: number;
        duration: number;
        geometry: string;
        steps: Array<{
          instruction: string;
          distance: number;
          direction: string;
        }>;
      }>;
    }>;
    primaryItinerary:
    Array<{
      duration: number;
      startTime: Date;
      endTime: Date;
      walkTime: number;
      transitTime: number;
      waitingTime: number;
      walkDistance: number;
      transfers: number;
      legs: Array<{
        mode: string;
        route: string;
        agency: string;
        from: {
          name: string;
          coordinates: [number, number];
          departureTime: Date | null;
        };
        to: {
          name: string;
          coordinates: [number, number];
          arrivalTime: Date | null;
        };
        distance: number;
        duration: number;
        geometry: string;
        steps: Array<{
          instruction: string;
          distance: number;
          direction: string;
        }>;
      }>;
    }>;
  }>;
}