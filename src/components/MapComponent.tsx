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
} from "react-map-gl/maplibre";
import { useSearchParams } from "react-router-dom";

import { appConfiguration } from "../configuration/config";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/map.css";
import {
  Location,
  RoutingAdapter,
  RoutingRequest,
  TransportationMode,
  LocationResult,
} from "../types/mapTypes";
import { transformOTPItinerary } from "../utils/otpTransformer";
import { DisplayItinerary } from "../types/routeDisplay";

interface MapComponentProps {
  itineraries: DisplayItinerary[];
  selectedItineraryId: string | null;
  onItinerariesChange?: (itineraries: DisplayItinerary[]) => void;
}

type RouteSegmentFeature = {
  type: "Feature";
  properties: {
    mode: string;
    segmentColor: string;
  };
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

type RouteSegmentsData = {
  type: "FeatureCollection";
  features: RouteSegmentFeature[];
};

type ModeStartFeature = {
  type: "Feature";
  properties: {
    mode: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
};

type ModeStartsData = {
  type: "FeatureCollection";
  features: ModeStartFeature[];
};

const DEFAULT_TRANSIT_COLOR = "#1779c2";
const WALK_SEGMENT_COLOR = "#6b7280";

const normalizeRouteColor = (routeColor?: string): string => {
  if (!routeColor) return DEFAULT_TRANSIT_COLOR;
  return routeColor.startsWith("#") ? routeColor : `#${routeColor}`;
};

const getSegmentColor = (mode: string, routeColor?: string): string => {
  if (mode === "WALK") return WALK_SEGMENT_COLOR;
  return normalizeRouteColor(routeColor);
};

const getModeStartLabel = (mode: string): string => {
  switch (mode) {
    case "BUS":
      return "Bus Start";
    case "TRAM":
      return "Tram Start";
    case "RAIL":
      return "Rail Start";
    case "SUBWAY":
      return "Subway Start";
    case "FERRY":
      return "Ferry Start";
    case "BICYCLE":
      return "Bike Start";
    default:
      return "Transit Start";
  }
};

function MapComponent({
  itineraries,
  selectedItineraryId,
  onItinerariesChange,
}: MapComponentProps) {
  const [searchParams] = useSearchParams();
  const mapRef = useRef<MapRef>(null);
  const [originMarker, setOriginMarker] = useState<Location | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<Location | null>(
    null
  );
  const previousItinerarySetRef = useRef<string>("");
  const previousSelectedItineraryIdRef = useRef<string | null>(null);
  const [routeSegmentsData, setRouteSegmentsData] = useState<RouteSegmentsData | null>(null);
  const [alternativeRouteSegmentsData, setAlternativeRouteSegmentsData] =
    useState<RouteSegmentsData | null>(null);
  const [modeStartsData, setModeStartsData] = useState<ModeStartsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState<LocationResult | null>(null);
  const [destination, setDestination] = useState<LocationResult | null>(null);
  const routeCalculatedRef = useRef<string>("");
  const onItinerariesChangeRef = useRef(onItinerariesChange);

  const routingEngineInstance: RoutingAdapter = useMemo(
    () => appConfiguration.routingEngines[appConfiguration.defaultRoutingEngine],
    []
  );

  useEffect(() => {
    onItinerariesChangeRef.current = onItinerariesChange;
  }, [onItinerariesChange]);

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

  const createSegmentFeatures = useCallback((itinerary: DisplayItinerary): RouteSegmentFeature[] => {
    return itinerary.legs
      .filter((leg) => leg.coordinates.length > 0)
      .map((leg) => ({
        type: "Feature",
        properties: {
          mode: leg.mode,
          segmentColor: getSegmentColor(leg.mode, leg.routeInfo?.routeColor),
        },
        geometry: {
          type: "LineString",
          coordinates: leg.coordinates,
        },
      }));
  }, []);

  const getItineraryCoordinates = useCallback((itinerary: DisplayItinerary): [number, number][] => {
    return itinerary.legs.flatMap((leg) => leg.coordinates);
  }, []);

  const applyItineraryToMap = useCallback(
    (selectedItinerary: DisplayItinerary | null, alternativeItineraries: DisplayItinerary[] = []) => {
      if (!selectedItinerary) {
        setRouteSegmentsData(null);
        setAlternativeRouteSegmentsData(null);
        setModeStartsData(null);
        return;
      }

      const segmentFeatures = createSegmentFeatures(selectedItinerary);

      const alternativeSegmentFeatures = alternativeItineraries.flatMap((itinerary) =>
        createSegmentFeatures(itinerary)
      );

      const modeStartFeatures: ModeStartFeature[] = selectedItinerary.legs
      .filter((leg) => leg.mode !== "WALK" && leg.coordinates.length > 0)
      .map((leg) => ({
        type: "Feature",
        properties: {
          mode: leg.mode,
        },
        geometry: {
          type: "Point",
          coordinates: leg.coordinates[0],
        },
      }));

      setRouteSegmentsData({
        type: "FeatureCollection",
        features: segmentFeatures,
      });
      setAlternativeRouteSegmentsData(
        alternativeSegmentFeatures.length > 0
          ? {
              type: "FeatureCollection",
              features: alternativeSegmentFeatures,
            }
          : null
      );
      setModeStartsData({
        type: "FeatureCollection",
        features: modeStartFeatures,
      });
    },
    [createSegmentFeatures]
  );

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
        const transformedItineraries = routes
          .filter((itinerary): itinerary is NonNullable<typeof itinerary> => Boolean(itinerary))
          .map((itinerary, index) => transformOTPItinerary(itinerary, index))
          .filter((itinerary) => itinerary.legs.length > 0);

        if (transformedItineraries.length === 0) {
          throw new Error("No itinerary data found");
        }

        onItinerariesChangeRef.current?.(transformedItineraries);

        const selectedItinerary = transformedItineraries[0];
        const alternativeItineraries = transformedItineraries.filter(
          (itinerary) => itinerary.id !== selectedItinerary.id
        );
        applyItineraryToMap(selectedItinerary, alternativeItineraries);
      } else {
        onItinerariesChangeRef.current?.([]);
        applyItineraryToMap(null, []);
      }
    } catch (error) {
      routeCalculatedRef.current = ""; // Reset on error so it can retry
      applyItineraryToMap(null, []);
      
      onItinerariesChangeRef.current?.([]);
    } finally {
      setLoading(false);
    }
  }, [
    originMarker,
    destinationMarker,
    routingEngineInstance,
    applyItineraryToMap,
  ]);

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

  const fitMapToCoordinates = useCallback((coordinates: [number, number][]) => {
    if (!mapRef.current || coordinates.length === 0) {
      return;
    }

    const [firstLongitude, firstLatitude] = coordinates[0];
    const bounds: [[number, number], [number, number]] = [
      [firstLongitude, firstLatitude],
      [firstLongitude, firstLatitude],
    ];

    coordinates.forEach(([longitude, latitude]) => {
      bounds[0][0] = Math.min(bounds[0][0], longitude);
      bounds[0][1] = Math.min(bounds[0][1], latitude);
      bounds[1][0] = Math.max(bounds[1][0], longitude);
      bounds[1][1] = Math.max(bounds[1][1], latitude);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 80,
      duration: 1200,
    });
  }, []);

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
    const selectedItinerary =
      itineraries.find((itinerary) => itinerary.id === selectedItineraryId) ??
      itineraries[0] ??
      null;
    const alternativeItineraries = selectedItinerary
      ? itineraries.filter((itinerary) => itinerary.id !== selectedItinerary.id)
      : [];
    applyItineraryToMap(selectedItinerary, alternativeItineraries);

    if (!selectedItinerary) {
      previousItinerarySetRef.current = "";
      previousSelectedItineraryIdRef.current = null;
      return;
    }

    const itinerarySetKey = itineraries.map((itinerary) => itinerary.id).join("|");
    const selectedCoordinates = getItineraryCoordinates(selectedItinerary);

    if (itinerarySetKey !== previousItinerarySetRef.current) {
      const allCoordinates = itineraries.flatMap((itinerary) => getItineraryCoordinates(itinerary));
      fitMapToCoordinates(allCoordinates.length > 0 ? allCoordinates : selectedCoordinates);
      previousItinerarySetRef.current = itinerarySetKey;
    } else if (previousSelectedItineraryIdRef.current !== selectedItinerary.id) {
      fitMapToCoordinates(selectedCoordinates);
    }

    previousSelectedItineraryIdRef.current = selectedItinerary.id;
  }, [itineraries, selectedItineraryId, applyItineraryToMap, getItineraryCoordinates, fitMapToCoordinates]);

  useEffect(() => {
    if (originMarker && destinationMarker) {
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
  }, [originMarker, destinationMarker, fitMapToMarkers, calculateRoute, flyToLocation]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -0.20119,
          latitude: 5.55619,
          zoom: 11,
        }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_TOKEN}`}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={false}
          showAccuracyCircle={true}
        />

        {originMarker && (
          <Marker
            longitude={originMarker.coordinates.longitude}
            latitude={originMarker.coordinates.latitude}
            anchor="bottom"
          >
            <div className="map-marker map-marker-start" aria-label={`Start: ${originMarker.name}`}>
              <span className="map-marker-label">Start</span>
              <span className="map-marker-pin">
                <span className="map-marker-pin-dot" />
              </span>
            </div>
          </Marker>
        )}

        {destinationMarker && (
          <Marker
            longitude={destinationMarker.coordinates.longitude}
            latitude={destinationMarker.coordinates.latitude}
            anchor="bottom"
          >
            <div className="map-marker map-marker-end" aria-label={`End: ${destinationMarker.name}`}>
              <span className="map-marker-label">End</span>
              <span className="map-marker-pin">
                <span className="map-marker-pin-dot" />
              </span>
            </div>
          </Marker>
        )}

        {modeStartsData && modeStartsData.features.length > 0 && (
          <>
            {modeStartsData.features.map((feature, index) => (
              <Marker
                key={`mode-start-${feature.properties.mode}-${feature.geometry.coordinates[0]}-${feature.geometry.coordinates[1]}-${index}`}
                longitude={feature.geometry.coordinates[0]}
                latitude={feature.geometry.coordinates[1]}
                anchor="bottom"
              >
                <div
                  className="map-marker map-marker-mode"
                  aria-label={`${getModeStartLabel(feature.properties.mode)}`}
                >
                  <span className="map-marker-label">
                    {getModeStartLabel(feature.properties.mode)}
                  </span>
                  <span className="map-marker-pin">
                    <span className="map-marker-pin-dot" />
                  </span>
                </div>
              </Marker>
            ))}
          </>
        )}

        {alternativeRouteSegmentsData && alternativeRouteSegmentsData.features.length > 0 && (
          <Source
            id="route-alternatives-source"
            type="geojson"
            data={alternativeRouteSegmentsData}
          >
            <Layer
              id="route-alternatives"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
                visibility: "visible",
              }}
              paint={{
                "line-color": ["get", "segmentColor"],
                "line-width": 4,
                "line-opacity": 0.24,
              }}
            />
          </Source>
        )}

        {routeSegmentsData && routeSegmentsData.features.length > 0 && (
          <>
            <Source 
              id="route-segments-source" 
              type="geojson" 
              data={routeSegmentsData}
            >
              {/* Route outline for better visibility */}
              <Layer 
                id="route-outline"
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                  visibility: "visible"
                }}
                paint={{
                  "line-color": "#111827",
                  "line-width": 8,
                  "line-opacity": 0.22,
                }}
              />

              <Layer 
                id="route"
                type="line"
                layout={{
                  "line-join": "round",
                  "line-cap": "round",
                  visibility: "visible"
                }}
                paint={{
                  "line-color": ["get", "segmentColor"],
                  "line-width": 6,
                  "line-opacity": 0.88,
                }}
              />
            </Source>

          </>
        )}
      </Map>

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
    </div>
  );
}

export default MapComponent;