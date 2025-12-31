import { LocationResult } from "../types/mapTypes";

//user agent constants and request intervals
const CONTACT_EMAIL =
  process.env.REACT_APP_NOMINATIM_EMAIL || "angelateyvi@gmail.com";
const USER_AGENT = `GoTrotro (${CONTACT_EMAIL})`;
const MIN_REQUEST_INTERVAL = 1500;
let lastRequestTime = 0;

export async function searchLocations(
  query: string
): Promise<LocationResult[]> {
  if (!query.trim()) return [];

  //Calculate time inbetween request and response
  const now = Date.now();
  const targetTime = Math.max(lastRequestTime + MIN_REQUEST_INTERVAL, now);
  lastRequestTime = targetTime;

  const waitTime = targetTime - now;
  if (waitTime > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  //url query params
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    countrycodes: "gh",
    limit: "15", // Increased from 10 to 15 suggestions
    dedupe: "1", // Remove duplicate results
    "accept-language": "en", // Prefer English results
    extratags: "1", // Get additional tags for better filtering
  });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Nominatim API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Filter out less relevant results (optional - can be adjusted)
    const filtered = data.filter((item: any) => {
      // Keep all results but you can add filters here
      // Example: return item.importance > 0.1;
      return true;
    });

    // Transform Nominatim response to our format
    const results = filtered.map((item: any) => ({
      place_name: item.display_name,
      coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
      center: [parseFloat(item.lon), parseFloat(item.lat)],
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      id: `${item.osm_type}-${item.osm_id}`,
      properties: {
        ...item,
        // Add useful properties for better display
        place_type: item.type,
        place_class: item.class,
        importance: item.importance,
        osm_type: item.osm_type,
        osm_id: item.osm_id,
      },
    }));

    // Sort by importance (higher importance first)
    return results.sort((a: any, b: any) => 
      (b.properties.importance || 0) - (a.properties.importance || 0)
    );
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error; // Re-throw so TanStack Query can handle retries
  }
}
