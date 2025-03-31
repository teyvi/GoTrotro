import { IRoutingEngine } from "../interfaces/IRoutingEngine";

export class OTPAdapter implements IRoutingEngine {
  async getRoute(origin: { longitude: number; latitude: number }, destination: { longitude: number; latitude: number }) {
    // Example OTP API call
    const response = await fetch(
      `https://otp-server.example.com/otp/routers/default/plan?fromPlace=${origin.latitude},${origin.longitude}&toPlace=${destination.latitude},${destination.longitude}&mode=TRANSIT,WALK`
    );
    const data = await response.json();

    if (data.plan && data.plan.itineraries.length > 0) {
      const itinerary = data.plan.itineraries[0];
      return {
        geometry: itinerary.geometry,
        distance: itinerary.distance,
        duration: itinerary.duration,
      };
    }

    throw new Error("No route found");
  }
}