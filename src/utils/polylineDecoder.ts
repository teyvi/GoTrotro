export function decodePolyline(encoded: string, precision: number = 1e5): number[][] {
  if (!encoded || encoded.length === 0) {
    return [];
  }

  const coordinates: number[][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  try {
    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte: number;

      // Decode latitude delta
      do {
        if (index >= encoded.length) {
          throw new Error("Unexpected end of polyline string while decoding latitude");
        }
        byte = encoded.charCodeAt(index++) - 63;
        if (byte < 0) {
          throw new Error(`Invalid byte value: ${byte + 63} at index ${index - 1}`);
        }
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;

      // Decode longitude delta
      do {
        if (index >= encoded.length) {
          throw new Error("Unexpected end of polyline string while decoding longitude");
        }
        byte = encoded.charCodeAt(index++) - 63;
        if (byte < 0) {
          throw new Error(`Invalid byte value: ${byte + 63} at index ${index - 1}`);
        }
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      // Return as [lng, lat] for GeoJSON format
      coordinates.push([lng / precision, lat / precision]);
    }
  } catch (error) {
    throw error;
  }

  return coordinates;
}
