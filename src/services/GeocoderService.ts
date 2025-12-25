import { LocationResult } from "../types/mapTypes";

//user agent constants and request intervals
const USER_AGENT = process.env.REACT_APP_USER_AGENT || "https://github.com/teyvi"
const MIN_REQUEST_INTERVAL = 1000;
let lastRequestTime = 0

export async  function searchLocations(query: string): Promise<LocationResult[]> {
      if (!query.trim()) return [];

      //Calculate time inbetween request and response
      // Reserve the next allowed request time to avoid race conditions
      const now = Date.now();
      const targetTime = Math.max(lastRequestTime + MIN_REQUEST_INTERVAL, now);

      // Reserve the slot immediately so concurrent callers see the reservation
      lastRequestTime = targetTime;

      const waitTime = targetTime - now;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=gh&limit=10`,
          {
            headers:{
              "User-Agent": USER_AGENT
            }
          }
        );
        const data = await response.json();
        
        return data.map((item: any) => ({
          place_name: item.display_name,
          coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
          properties: item
        }));
      } catch (error) {
        console.error("Error searching locations:", error);
        return [];
      }
    }

