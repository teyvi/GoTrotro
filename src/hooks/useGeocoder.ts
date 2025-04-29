import { useEffect } from "react";
import MaplibreGeocoder, { MaplibreGeocoderApiConfig, MaplibreGeocoderFeatureResults } from "@maplibre/maplibre-gl-geocoder";

export function useGeocoder(
  geocoderRef: React.RefObject<HTMLDivElement | null>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  setValue: (value: string) => void,
  onSelect?: (result: any) => void
) {
  useEffect(() => {
    if (!geocoderRef.current) return;

    const geocoderApi = {
      forwardGeocode: async (config: MaplibreGeocoderApiConfig): Promise<MaplibreGeocoderFeatureResults> => {
        const features: any[] = [];
        try {
          if (!config.query) {
            throw new Error("Query is required for forwardGeocode.");
          }

          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
          const response = await fetch(request);
          const geojson = await response.json();

          for (const feature of geojson.features) {
            const center = [
              feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
            ];
            const point = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: center,
              },
              place_name: feature.properties.display_name,
              properties: feature.properties,
              text: feature.properties.display_name,
              place_type: ["place"],
              center,
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
