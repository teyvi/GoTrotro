import { GeocoderAdapter, GeocoderSearchOptions, LocationResult } from "../../types/mapTypes";

export type PhotonAdapterConfig = {
  minRequestInterval?: number;
};

export class PhotonAdapter implements GeocoderAdapter {
  private photonEndpointURL: URL;
  private settings: PhotonAdapterConfig;
  private lastRequestTime: number = 0;

  /**
   * @param photonEndpointUrl base url of the Photon endpoint e.g. https://photon.komoot.io
   * @param settings Configuration for Photon including rate limiting
   */
  constructor(
    photonEndpointUrl: URL | string,
    settings?: PhotonAdapterConfig
  ) {
    if (typeof photonEndpointUrl === "string") {
      this.photonEndpointURL = new URL(photonEndpointUrl);
    } else {
      this.photonEndpointURL = photonEndpointUrl;
    }

    // Default settings
    this.settings = {
      minRequestInterval: settings?.minRequestInterval || 100, // Photon is more lenient
    };
  }

  get endpointURL() {
    return this.photonEndpointURL;
  }

  get photonSettings() {
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
      limit: String(options?.limit || 15),
      lang: options?.language || "en",
    });

    if (options?.countryCode) {
      // Photon uses a slightly different format for country codes
      params.set("osm_tag", `place:country:${options.countryCode}`);
    }

    if (options?.bbox) {
      const [minLon, minLat, maxLon, maxLat] = options.bbox;
      params.set("bbox", `${minLon},${minLat},${maxLon},${maxLat}`);
    }

    const url = `${this.photonEndpointURL}/api?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Photon API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.features || !Array.isArray(data.features)) {
        return [];
      }

      // Transform Photon GeoJSON response to our LocationResult format
      const results: LocationResult[] = data.features.map((feature: any) => {
        const coords = feature.geometry.coordinates;
        const props = feature.properties;

        // Build display name from Photon properties
        const nameParts = [
          props.name,
          props.street,
          props.city,
          props.state,
          props.country,
        ].filter(Boolean);
        const displayName = nameParts.join(", ");

        return {
          place_name: displayName || props.name || "Unknown location",
          coordinates: [coords[0], coords[1]],
          center: [coords[0], coords[1]],
          latitude: coords[1],
          longitude: coords[0],
          id: `photon-${feature.properties.osm_id || Math.random()}`,
          properties: {
            ...props,
            place_type: props.type,
            osm_type: props.osm_type,
            osm_id: props.osm_id,
            importance: props.importance || 0,
          },
        };
      });

      // Sort by importance if available
      return results.sort(
        (a: any, b: any) =>
          (b.properties.importance || 0) - (a.properties.importance || 0)
      );
    } catch (error) {
      console.error("Error searching locations with Photon:", error);
      throw error;
    }
  }
}

