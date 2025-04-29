import { IRoutingEngine } from "../interfaces/IRoutingEngine";

export class OSRMAdapter implements IRoutingEngine {
  async getRoute(origin: { longitude: number; latitude: number }, destination: { longitude: number; latitude: number }) {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
    );
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        geometry: route.geometry,
        distance: route.distance,
        duration: route.duration,
      };
    }

    throw new Error("No route found");
  }
}