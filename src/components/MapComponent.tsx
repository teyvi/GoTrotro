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
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/map.css";
import RoutingEngineFactory from "../routingEngines/RoutingEngineFactories";
import { Location, RouteData } from "../types/mapTypes";
import { useLocation } from "../hooks/useLocation";
import debounce from "lodash.debounce";

function MapComponent({ routingEngine = "OSRM" }: { routingEngine: string }) {
  const { origin, destination } = useLocation();
  const mapRef = useRef<MapRef>(null);
  const [originMarker, setOriginMarker] = useState<Location | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<Location | null>(
    null
  );
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const routingEngineInstance = useMemo(() => {
    return RoutingEngineFactory.createEngine(routingEngine);
  }, [routingEngine]);

  const calculateRoute = useCallback(
    debounce(async () => {
      if (!originMarker || !destinationMarker) return;

      setLoading(true);

      try {
        const route = await routingEngineInstance.getRoute(
          originMarker,
          destinationMarker
        );

        if (!route || !route.geometry || !route.distance || !route.duration) {
          throw new Error("Invalid route data");
        }

        setRouteData({
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        });

        const distanceInKm = (route.distance / 1000).toFixed(1);
        setRouteDistance(distanceInKm);

        const durationInMinutes = Math.round(route.duration / 60);
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;

        setRouteDuration(
          hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
        );
      } catch (error) {
        console.error("Error calculating route:", error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [originMarker, destinationMarker, routingEngineInstance]
  );

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
    debounce(() => {
      if (mapRef.current && originMarker && destinationMarker) {
        const bounds: [[number, number], [number, number]] = [
          [originMarker.longitude, originMarker.latitude],
          [destinationMarker.longitude, destinationMarker.latitude],
        ];
        mapRef.current.fitBounds(bounds, {
          padding: 100,
          duration: 2000,
        });
      }
    }, 300),
    [originMarker, destinationMarker]
  );

  useEffect(() => {
    if (origin?.coordinates) {
      setOriginMarker((prev) => {
        if (
          prev?.longitude === origin.coordinates[0] &&
          prev?.latitude === origin.coordinates[1]
        ) {
          return prev; 
        }
        return {
          longitude: origin.coordinates[0],
          latitude: origin.coordinates[1],
          name: origin.place_name,
          center: origin.coordinates,
          place_name: origin.place_name,
        };
      });
    }

    if (destination?.coordinates) {
      setDestinationMarker((prev) => {
        if (
          prev?.longitude === destination.coordinates[0] &&
          prev?.latitude === destination.coordinates[1]
        ) {
          return prev; 
        }
        return {
          longitude: destination.coordinates[0],
          latitude: destination.coordinates[1],
          name: destination.place_name,
          center: destination.coordinates,
          place_name: destination.place_name,
        };
      });
    }

    if (origin?.coordinates && destination?.coordinates) {
      fitMapToMarkers();
      calculateRoute();
    } else if (origin?.coordinates) {
      flyToLocation(origin.coordinates[0], origin.coordinates[1]);
    } else if (destination?.coordinates) {
      flyToLocation(destination.coordinates[0], destination.coordinates[1]);
    }
  }, [origin, destination, fitMapToMarkers, calculateRoute, flyToLocation]);

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
            longitude={originMarker.longitude}
            latitude={originMarker.latitude}
            anchor="bottom"
            color="#0000FF"
          />
        )}

        {destinationMarker && (
          <Marker
            longitude={destinationMarker.longitude}
            latitude={destinationMarker.latitude}
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
