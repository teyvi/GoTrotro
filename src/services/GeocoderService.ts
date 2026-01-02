import { LocationResult, GeocoderSearchOptions } from "../types/mapTypes";
import { appConfiguration } from "../configuration/config";

/**
 * Search for locations using the configured geocoder adapter
 * @param query - The search query string
 * @param options - Optional geocoder search options
 * @returns Promise with array of location results
 */
export async function searchLocations(
  query: string,
  options?: GeocoderSearchOptions
): Promise<LocationResult[]> {
  if (!query.trim()) return [];

  // Get the configured geocoder adapter
  const geocoder = appConfiguration.geocoders[appConfiguration.defaultGeocoder];

  if (!geocoder) {
    throw new Error(
      `Geocoder "${appConfiguration.defaultGeocoder}" is not configured. Available geocoders: ${Object.keys(appConfiguration.geocoders).join(", ")}`
    );
  }

  try {
    // Use default options if not provided
    const searchOptions: GeocoderSearchOptions = {
      limit: 15,
      countryCode: "gh", // Ghana - can be made configurable
      language: "en",
      ...options,
    };

    return await geocoder.search(query, searchOptions);
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error; // Re-throw so TanStack Query can handle retries
  }
}

/**
 * Search for locations using a specific geocoder
 * @param geocoderName - The name of the geocoder to use (e.g., "nominatim", "photon")
 * @param query - The search query string
 * @param options - Optional geocoder search options
 * @returns Promise with array of location results
 */
export async function searchLocationsWithGeocoder(
  geocoderName: string,
  query: string,
  options?: GeocoderSearchOptions
): Promise<LocationResult[]> {
  if (!query.trim()) return [];

  const geocoder = appConfiguration.geocoders[geocoderName];

  if (!geocoder) {
    throw new Error(
      `Geocoder "${geocoderName}" is not configured. Available geocoders: ${Object.keys(appConfiguration.geocoders).join(", ")}`
    );
  }

  try {
    const searchOptions: GeocoderSearchOptions = {
      limit: 15,
      countryCode: "gh",
      language: "en",
      ...options,
    };

    return await geocoder.search(query, searchOptions);
  } catch (error) {
    console.error(`Error searching locations with ${geocoderName}:`, error);
    throw error;
  }
}
