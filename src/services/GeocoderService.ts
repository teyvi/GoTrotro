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
    limit: "10",
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

    // Transform Nominatim response to our format
    return data.map((item: any) => ({
      place_name: item.display_name,
      coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
      properties: item,
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error; // Re-throw so TanStack Query can handle retries
  }
}
