export interface IRoutingEngine {
    getRoute(origin: { longitude: number; latitude: number }, destination: { longitude: number; latitude: number }): Promise<{
      geometry: any; // GeoJSON geometry
      distance: number; // Distance in meters
      duration: number; // Duration in seconds
    }>;
  }