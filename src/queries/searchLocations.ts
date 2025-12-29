import { useQuery } from "@tanstack/react-query"
import { searchLocations } from "../services/GeocoderService"

export function useLocationSearch(query: string, enabled: boolean = true){
return useQuery({
    queryKey: ['locations', query],
    queryFn: () => searchLocations(query),
    enabled: enabled && query.trim().length > 3,
    staleTime: 5 * 60 * 1000, //5 minutes
    gcTime: 10 * 60 * 1000, //10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})
}