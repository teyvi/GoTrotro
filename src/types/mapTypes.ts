export type Point = {
  longitude: number,
  latitude: number
}
export type Location = {
  center: Point;
  place_name: string; // Name of the location
  point: Point
  name: string;
}

export interface RouteData {
  type: "Feature";
  properties: {};
  geometry: {
    type: "LineString";
    coordinates: Point[];
  };
}

export interface RouteInfo {
  distance: string; // Distance in kilometers
  duration: string; // Duration in hours/minutes
}

export interface MapComponentProps {
  origin: Location;
  destination: Location;
  routingEngine?: string;
}

export type GeocoderInputProps = {
  placeholder: string;
  icon: "origin" | "destination";
  inputRef: React.Ref<HTMLInputElement>;
  geocoderRef: React.Ref<HTMLDivElement>;
  value: string;
}

export type SearchComponentProps = {
  onOriginSelect?: (result: any) => void;
  onDestinationSelect?: (result: any) => void;
  onSwapLocations?: () => void;
};


// Define our location result type for better type safety
export type LocationResult = {
  place_name: string;
  coordinates: [number, number]; // [longitude, latitude]
  properties: Record<string, any>;
  center: [number, number]
  latitude: number,
  longitude: number,
};

export type LocationContextType = {
  origin: LocationResult | null;
  destination: LocationResult | null;
  setOrigin: (location: LocationResult | null) => void;
  setDestination: (location: LocationResult | null) => void;
  swapLocations: () => void;
};

export enum TransportationModes {
  BICYCLE = 0,
  WALK = 1,
  TRANSIT = 2,
  CAR = 3
}

export type RoutingRequest = {
  origin: Point,
  destination: Point,
  mode: TransportationModes[],
  wheelchair: boolean
}

export type Itineraries = {
  duration: number;
  startTime: Date;
  endTime: Date;
  walkTime: number;
  transitTime: number;
  waitingTime: number;
  walkDistance: number;
  transfers: number;
} | null

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