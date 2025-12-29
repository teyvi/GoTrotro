import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  GeolocateControl,
  Map,
  NavigationControl,
  Marker,
  Source,
  Layer,
  MapRef,
  LayerProps,
} from "react-map-gl/maplibre";
import { useSearchParams } from "react-router-dom";

import { appConfiguration } from "../configuration/config";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/map.css";
import {
  Location,
  RouteData,
  RoutingAdapter,
  RoutingRequest,
  TransportationMode,
  LocationResult,
  Itinerary,
} from "../types/mapTypes";
import { decodePolyline } from "../utils/polylineDecoder";
import debounce from "lodash.debounce";

function MapComponent() {
  const [searchParams] = useSearchParams();
  const mapRef = useRef<MapRef>(null);
  const [originMarker, setOriginMarker] = useState<Location | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<Location | null>(
    null
  );
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState<LocationResult | null>(null);
  const [destination, setDestination] = useState<LocationResult | null>(null);
  const routeCalculatedRef = useRef<string>("");

  const routingEngineInstance: RoutingAdapter = useMemo(
    () => appConfiguration.routingEngines[appConfiguration.defaultRoutingEngine],
    []
  );

  // Parse URL params to get origin and destination coordinates - run only once on mount
  useEffect(() => {
    const originParam = searchParams.get("origin");
    const destinationParam = searchParams.get("destination");
    const originCoordsParam = searchParams.get("originCoords");
    const destCoordsParam = searchParams.get("destCoords");

    if (originCoordsParam && originParam) {
      const [longitude, latitude] = originCoordsParam.split(",").map(Number);
      if (!isNaN(longitude) && !isNaN(latitude)) {
        setOrigin({
          place_name: originParam,
          coordinates: [longitude, latitude],
          center: [longitude, latitude],
          latitude,
          longitude,
          properties: {},
        });
      }
    }

    if (destCoordsParam && destinationParam) {
      const [longitude, latitude] = destCoordsParam.split(",").map(Number);
      if (!isNaN(longitude) && !isNaN(latitude)) {
        setDestination({
          place_name: destinationParam,
          coordinates: [longitude, latitude],
          center: [longitude, latitude],
          latitude,
          longitude,
          properties: {},
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Extracts and decodes geometry from itinerary legs
   * Handles both decoded geometry arrays and encoded polyline strings
   */
  const extractGeometryFromItinerary = (itinerary: Itinerary | null): number[][] => {
    if (!itinerary) {
      return [];
    }

    const allCoordinates: number[][] = [];

    // Check if geometry is directly on itinerary (already decoded)
    if (itinerary.geometry && Array.isArray(itinerary.geometry) && itinerary.geometry.length > 0) {
      // Check if it's already in the correct format
      if (Array.isArray(itinerary.geometry[0])) {
        return itinerary.geometry as number[][];
      }
    }

    // Try to extract from legs (for OTP API responses)
    if (itinerary.legs && Array.isArray(itinerary.legs)) {
      for (const leg of itinerary.legs) {
        // legGeometry exists on OTP API response structure but not in type definition
        const legGeometry = (leg as any).legGeometry;
        
        if (legGeometry?.points) {
          // Decode encoded polyline string
          try {
            const decodedCoords = decodePolyline(legGeometry.points);
            allCoordinates.push(...decodedCoords);
          } catch (error) {
            console.warn("Failed to decode polyline from leg:", error);
          }
        } else if (legGeometry?.coordinates && Array.isArray(legGeometry.coordinates)) {
          // Already decoded coordinates
          allCoordinates.push(...legGeometry.coordinates);
        }
      }
    }

    return allCoordinates;
  };

  /**
   * Calculates total distance from itinerary legs
   */
  const calculateTotalDistance = (itinerary: Itinerary | null): number => {
    if (!itinerary) {
      return 0;
    }

    let totalDistance = 0;

    if (itinerary.legs && Array.isArray(itinerary.legs)) {
      for (const leg of itinerary.legs) {
        // distance exists on OTP API response structure but not in type definition
        const legDistance = (leg as any).distance;
        if (legDistance && typeof legDistance === 'number') {
          totalDistance += legDistance;
        }
      }
    }

    // Fallback to itinerary distance if available
    if (totalDistance === 0 && itinerary.distance) {
      totalDistance = itinerary.distance;
    }

    return totalDistance;
  };

  const calculateRoute = useCallback(async () => {
    if (!originMarker || !destinationMarker) return;

    // Create a unique key for this origin/destination pair
    const routeKey = `${originMarker.coordinates.longitude},${originMarker.coordinates.latitude}-${destinationMarker.coordinates.longitude},${destinationMarker.coordinates.latitude}`;
    
    // Guard: only calculate if we haven't calculated for this pair
    if (routeCalculatedRef.current === routeKey) return;
    
    routeCalculatedRef.current = routeKey;
    setLoading(true);
    try {
      const routingRequest: RoutingRequest = {
        origin: originMarker.coordinates,
        destination: destinationMarker.coordinates,
        modes: [TransportationMode.TRANSIT, TransportationMode.WALK],
        wheelchair: false,
      };
      const routes = await routingEngineInstance.getRoute(routingRequest);

      if (routes.length > 0) {
        const itinerary = routes[0]; // TODO: Remove when GUI for choosing the itinerary exists

        if (!itinerary) {
          throw new Error("Invalid itinerary data");
        }

        // Extract and decode geometry from legs
        const coordinates = extractGeometryFromItinerary(itinerary);

        if (coordinates.length === 0) {
          throw new Error("No geometry data found in route");
        }

        setRouteData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates as [number, number][],
          },
        });

        // Calculate total distance from legs
        const totalDistanceMeters = calculateTotalDistance(itinerary);
        const distanceInKm = (totalDistanceMeters / 1000).toFixed(1);
        setRouteDistance(distanceInKm);

        // Calculate duration
        const durationInMinutes = Math.round(itinerary.duration / 60);
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;

        setRouteDuration(
          hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
        );
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      routeCalculatedRef.current = ""; // Reset on error so it can retry
      setRouteData(null);
      setRouteDistance(null);
      setRouteDuration(null);
    } finally {
      setLoading(false);
    }
  }, [originMarker, destinationMarker, routingEngineInstance]);

  const flyToLocation = useCallback((longitude: number, latitude: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        duration: 2000,
      });
    }
  }, []);

  const fitMapToMarkers = useCallback(
    (
      originLng: number,
      originLat: number,
      destLng: number,
      destLat: number
    ) => {
      if (mapRef.current) {
        const bounds: [[number, number], [number, number]] = [
          [originLng, originLat],
          [destLng, destLat],
        ];
        mapRef.current.fitBounds(bounds, {
          padding: 100,
          duration: 2000,
        });
      }
    },
    []
  );

  // Effect 1: Set markers when origin/destination change
  useEffect(() => {
    if (origin?.coordinates) {
      setOriginMarker({
        coordinates: {
          longitude: origin.coordinates[0],
          latitude: origin.coordinates[1],
        },
        name: origin.place_name,
      });
    }

    if (destination?.coordinates) {
      setDestinationMarker({
        coordinates: {
          longitude: destination.coordinates[0],
          latitude: destination.coordinates[1],
        },
        name: destination.place_name,
      });
    }
  }, [origin, destination]);

  // Effect 2: Handle map positioning and route calculation when markers change
  useEffect(() => {
    if (originMarker && destinationMarker) {
      // Reset route calculation ref when markers change
      routeCalculatedRef.current = "";
      fitMapToMarkers(
        originMarker.coordinates.longitude,
        originMarker.coordinates.latitude,
        destinationMarker.coordinates.longitude,
        destinationMarker.coordinates.latitude
      );
      calculateRoute();
    } else if (originMarker) {
      flyToLocation(
        originMarker.coordinates.longitude,
        originMarker.coordinates.latitude
      );
    } else if (destinationMarker) {
      flyToLocation(
        destinationMarker.coordinates.longitude,
        destinationMarker.coordinates.latitude
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originMarker, destinationMarker]);

  const routeLayerStyle: LayerProps = useMemo(
    () => ({
      id: "route",
      type: "line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#4285F4",
        "line-width": 4,
        "line-opacity": 0.8,
      },
    }),
    []
  );

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -0.205874,
          latitude: 5.614818,
          zoom: 11,
        }}
        style={{
          position: "absolute",
          width: "100%",
          height: "calc(100vh)",
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_TOKEN}`}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
        />

        {originMarker && (
          <Marker
            longitude={originMarker.coordinates.longitude}
            latitude={originMarker.coordinates.latitude}
            anchor="bottom"
            color="#0000FF"
          />
        )}

        {destinationMarker && (
          <Marker
            longitude={destinationMarker.coordinates.longitude}
            latitude={destinationMarker.coordinates.latitude}
            anchor="bottom"
            color="#FF0000"
          />
        )}

        {routeData && (
          <Source id="route-source" type="geojson" data={routeData}>
            <Layer {...routeLayerStyle} />
          </Source>
        )}
      </Map>

      {routeData && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-10">
          <h3 className="font-bold text-lg mb-2">Route Information</h3>
          <div className="text-sm">
            <p className="mb-1">
              <span className="font-medium">Distance:</span> {routeDistance} km
            </p>
            <p>
              <span className="font-medium">Duration:</span> {routeDuration}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-4 rounded-lg shadow-lg z-10">
          <div className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Calculating route...</span>
          </div>
        </div>
      )}
    </>
  );
}

export default MapComponent;
