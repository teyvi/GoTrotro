export interface Location {
    center: [number, number]; // Longitude and latitude
    place_name: string; // Name of the location
    longitude: number;
    latitude: number;
    name: string; 
  }
  
  export interface RouteData {
    type: "Feature";
    properties: {};
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
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