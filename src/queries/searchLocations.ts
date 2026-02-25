import { useState, useEffect } from "react";
import { searchLocations } from "../services/GeocoderService";
import { LocationResult } from "../types/mapTypes";

/**
 * Hook to search for locations
 * @param query - The search query string
 * @param enabled - Whether the query should be enabled
 * @returns Query result with location data
 */
export function useLocationSearch(query: string, enabled: boolean = true) {
  const [data, setData] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || query.trim().length <= 2) {
      setData([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const fetchData = async () => {
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const results = await searchLocations(query);
          if (!cancelled) {
            setData(results);
            setIsLoading(false);
          }
          return;
        } catch (error) {
          if (retries < maxRetries) {
            const delay = Math.min(1000 * 2 ** retries, 30000);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries++;
          } else {
            if (!cancelled) {
              console.error("Error searching locations:", error);
              setData([]);
              setIsLoading(false);
            }
            return;
          }
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [query, enabled]);

  return { data, isLoading };
}