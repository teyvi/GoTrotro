import { useQuery } from "@tanstack/react-query"
import { searchLocations } from "../services/GeocoderService"

export function useLocationSearch(query: string, enabled: boolean = true){
return useQuery({
    queryKey: ['locations', query],
    queryFn: () => searchLocations(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2
})
}