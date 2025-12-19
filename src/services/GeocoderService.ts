import { LocationResult } from "../types/mapTypes";

export class GeocoderService {
    static async searchLocations(query: string): Promise<LocationResult[]> {
      if (!query.trim()) return [];
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&countrycodes=gh&limit=5`
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
  }
  