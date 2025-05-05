import { IOTPEngine } from './../../types/mapTypes';

 const BASE_URL = process.env.REACT_APP_OTP_API;
const DEFAULT_MAX_WALK_DISTANCE = 804.672;

export const createOTPAdapter = (): IOTPEngine => {
  const formatTime = (date: Date) =>
    date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();

  const formatDate = (date: Date) =>
    `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}-${date.getFullYear()}`;

  return {
    getRoute: async (origin, destination, options = {}) => {
      const { arriveBy = false, wheelChair = false } = options;
      const now = new Date();

      const params = new URLSearchParams({
        fromPlace: `${origin.latitude},${origin.longitude}`,
        toPlace: `${destination.latitude},${destination.longitude}`,
        time: formatTime(now),
        date: formatDate(now),
        mode: "TRANSIT,WALK",
        maxWalkDistance: DEFAULT_MAX_WALK_DISTANCE.toString(),
        arriveBy: String(arriveBy),
        wheelchair: String(wheelChair),
        locale: "en",
      });

      const response = await fetch(`${BASE_URL}?${params}`);
      const data = await response.json();

      if (!data.plan?.itineraries?.length) {
        throw new Error("No route found");
      }

      const itinerary = data.plan.itineraries[0];
      return {
        destination:itinerary.destination,
        origin:itinerary.origin, 
        itineraries: itinerary.itineraries, 
        primaryItinerary: itinerary.primaryItinerary,
      };
    },
  };
};
