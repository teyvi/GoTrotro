import { useEffect } from "react";
import MaplibreGeocoder, { MaplibreGeocoderApiConfig, MaplibreGeocoderFeatureResults } from "@maplibre/maplibre-gl-geocoder";
import { appConfiguration } from "../configuration/config";

export function useGeocoder(
  geocoderRef: React.RefObject<HTMLDivElement | null>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  setValue: (value: string) => void,
  onSelect?: (result: any) => void
) {
  useEffect(() => {
    if (!geocoderRef.current) return;

    // Get the configured geocoder adapter
    const geocoderAdapter = appConfiguration.geocoders[appConfiguration.defaultGeocoder];

    if (!geocoderAdapter) {
      console.error(`Geocoder "${appConfiguration.defaultGeocoder}" is not configured`);
      return;
    }

    const geocoderApi = {
      forwardGeocode: async (config: MaplibreGeocoderApiConfig): Promise<MaplibreGeocoderFeatureResults> => {
        const features: any[] = [];
        try {
          if (!config.query) {
            throw new Error("Query is required for forwardGeocode.");
          }

          // Ensure query is a string
          const queryString = typeof config.query === 'string' ? config.query : config.query.join(' ');

          // Use the configured geocoder adapter
          const results = await geocoderAdapter.search(queryString, {
            limit: 15,
            countryCode: "gh",
            language: "en"
          });

          // Transform LocationResult to MapLibre GeoJSON format
          for (const result of results) {
            const point = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: result.coordinates,
              },
              place_name: result.place_name,
              properties: result.properties,
              text: result.place_name,
              place_type: ["place"],
              center: result.center,
            };
            features.push(point);
          }
        } catch (e) {
          console.error(`Failed to forwardGeocode with error: ${e}`);
        }
        return { type: "FeatureCollection", features };
      },
    };

    const geocoder = new MaplibreGeocoder(geocoderApi, {
      placeholder: "Search",
      clearOnBlur: false,
      clearAndBlurOnEsc: false,
    });

    geocoderRef.current.appendChild(geocoder.onAdd());

    geocoder.on("result", (e: { result: { place_name: string } }) => {
      const placeName = e.result.place_name;
      setValue(placeName);

      if (inputRef.current) {
        inputRef.current.value = placeName;
      }

      onSelect && onSelect(e.result);
    });

    return () => {
      geocoder.onRemove();
    };
  }, [geocoderRef, inputRef, setValue, onSelect]);
}
