import { IRoutingEngine } from "../interfaces/IRoutingEngine";

export class ValhallaAdapter implements IRoutingEngine {
  async getRoute(origin: { longitude: number; latitude: number }, destination: { longitude: number; latitude: number }) {
    // Example Valhalla API call
    const response = await fetch(
      `https://valhalla.example.com/route?json={"locations":[{"lat":${origin.latitude},"lon":${origin.longitude}},{"lat":${destination.latitude},"lon":${destination.longitude}}],"costing":"auto"}`
    );
    const data = await response.json();

    if (data.trip && data.trip.legs.length > 0) {
      const leg = data.trip.legs[0];
      return {
        geometry: leg.shape, // Valhalla uses encoded polylines
        distance: leg.summary.length * 1000, // Convert km to meters
        duration: leg.summary.time, // Duration in seconds
      };
    }

    throw new Error("No route found");
  }
}