import { useQuery } from "@tanstack/react-query";
import { searchLocations } from "../services/GeocoderService";

/**
 * Hook to search for locations using React Query
 * @param query - The search query string
 * @param enabled - Whether the query should be enabled
 * @returns Query result with location data
 */
export function useLocationSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['locations', query],
    queryFn: () => searchLocations(query),
    // Match the length check in Home.tsx (> 2 means minimum 3 characters)
    enabled: enabled && query.trim().length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}