import { IValhallaEngine } from '../../types/mapTypes';

export const createValhallaAdapter = (): IValhallaEngine => {
  return {
    getRoute: async (
      origin: { longitude: number; latitude: number },
      destination: { longitude: number; latitude: number },
      mode: string,
      options?: {
        arriveBy?: boolean;
        wheelChair?: boolean;
      }
    ): Promise<{
      geometry: any,
      distance: number,
      duration: number
    }> => {
      // Map the mode parameter to Valhalla's costing parameter
      // Default to 'auto' if mode isn't recognized
      const costingMode =
        mode === 'car' ? 'auto' :
          mode === 'bicycle' ? 'bicycle' :
            mode === 'pedestrian' ? 'pedestrian' :
              mode; // Use provided mode directly if it doesn't match known values

      // Construct the API request with proper JSON format
      const requestBody: any = {
        locations: [
          { lat: origin.latitude, lon: origin.longitude },
          { lat: destination.latitude, lon: destination.longitude }
        ],
        costing: costingMode
      };

      // Handle options
      if (options) {
        requestBody.options = {};

        if (options.arriveBy) {
          // Valhalla doesn't directly support arriveBy, but you could
          // implement this by modifying the request or using a different endpoint
          requestBody.options.arrive_by = true;
        }

        if (options.wheelChair) {
          // Add wheelchair accessibility options
          requestBody.options.costing_options = {
            [costingMode]: {
              wheelchair: true
            }
          };
        }
      }

      // Make the API call
      const response = await fetch(
        `https://valhalla.example.com/route?json=${encodeURIComponent(JSON.stringify(requestBody))}`
      );

      const data = await response.json();

      if (data.trip && data.trip.legs.length > 0) {
        const leg = data.trip.legs[0];
        return {
          geometry: leg.shape, // Valhalla uses encoded polylines
          distance: leg.summary.length * 1000, // Convert km to meters
          duration: leg.summary.time, // Duration in seconds
        };
      }

      throw new Error("No route found");
    }
  };
};