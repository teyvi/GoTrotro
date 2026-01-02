import { GeocoderAdapter, GeocoderSearchOptions, LocationResult } from "../../types/mapTypes";

export type NominatimAdapterConfig = {
  userAgent?: string;
  email?: string;
  minRequestInterval?: number;
};

export class NominatimAdapter implements GeocoderAdapter {
  private nominatimEndpointURL: URL;
  private settings: NominatimAdapterConfig;
  private lastRequestTime: number = 0;

  /**
   * @param nominatimEndpointUrl base url of the Nominatim endpoint e.g. https://nominatim.openstreetmap.org
   * @param settings Configuration for Nominatim including user agent and rate limiting
   */
  constructor(
    nominatimEndpointUrl: URL | string,
    settings?: NominatimAdapterConfig
  ) {
    if (typeof nominatimEndpointUrl === "string") {
      this.nominatimEndpointURL = new URL(nominatimEndpointUrl);
    } else {
      this.nominatimEndpointURL = nominatimEndpointUrl;
    }

    // Default settings
    this.settings = {
      userAgent: settings?.userAgent || "GoTrotro",
      email: settings?.email || "contact@gotrotro.example",
      minRequestInterval: settings?.minRequestInterval || 1000, // Nominatim requires 1 request per second max
    };
  }

  get endpointURL() {
    return this.nominatimEndpointURL;
  }

  get nominatimSettings() {
    return this.settings;
  }

  public async search(
    query: string,
    options?: GeocoderSearchOptions
  ): Promise<LocationResult[]> {
    if (!query.trim()) return [];

    // Rate limiting
    const now = Date.now();
    const targetTime = Math.max(
      this.lastRequestTime + this.settings.minRequestInterval!,
      now
    );
    this.lastRequestTime = targetTime;

    const waitTime = targetTime - now;
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Build query parameters
    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: String(options?.limit || 15),
      dedupe: "1",
      "accept-language": options?.language || "en",
      extratags: "1",
    });

    if (options?.countryCode) {
      params.set("countrycodes", options.countryCode);
    }

    if (options?.bbox) {
      const [minLon, minLat, maxLon, maxLat] = options.bbox;
      params.set("viewbox", `${minLon},${minLat},${maxLon},${maxLat}`);
      params.set("bounded", "1");
    }

    const url = `${this.nominatimEndpointURL}/search?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": `${this.settings.userAgent} (${this.settings.email})`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Nominatim API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Transform Nominatim response to our LocationResult format
      const results: LocationResult[] = data.map((item: any) => ({
        place_name: item.display_name,
        coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
        center: [parseFloat(item.lon), parseFloat(item.lat)],
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        id: `${item.osm_type}-${item.osm_id}`,
        properties: {
          ...item,
          place_type: item.type,
          place_class: item.class,
          importance: item.importance,
          osm_type: item.osm_type,
          osm_id: item.osm_id,
        },
      }));

      // Sort by importance (higher importance first)
      return results.sort(
        (a: any, b: any) =>
          (b.properties.importance || 0) - (a.properties.importance || 0)
      );
    } catch (error) {
      console.error("Error searching locations with Nominatim:", error);
      throw error;
    }
  }
}

