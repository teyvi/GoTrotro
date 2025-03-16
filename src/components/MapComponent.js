import React, { useRef, useEffect, useState } from "react";
import {
  GeolocateControl,
  Map,
  NavigationControl,
  Marker,
  Source,
  Layer
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/map.css";

function MapComponent({ origin, destination }) {
  const mapRef = useRef(null);
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Default view state for Ghana
  const [viewState, setViewState] = useState({
    longitude: -0.205874,
    latitude: 5.614818,
    zoom: 11,
  });

  // Set origin marker when origin prop changes
  useEffect(() => {
    if (origin && origin.center) {
      setOriginMarker({
        longitude: origin.center[0],
        latitude: origin.center[1],
        name: origin.place_name
      });
      
      // If we have both markers, fit the map to show both
      if (destinationMarker) {
        fitMapToMarkers();
        calculateRoute();
      } else {
        // Otherwise just fly to the origin
        flyToLocation(origin.center[0], origin.center[1]);
      }
    }
  }, [origin]);

  // Set destination marker when destination prop changes
  useEffect(() => {
    if (destination && destination.center) {
      setDestinationMarker({
        longitude: destination.center[0],
        latitude: destination.center[1],
        name: destination.place_name
      });
      
      // If we have both markers, fit the map to show both
      if (originMarker) {
        fitMapToMarkers();
        calculateRoute();
      } else {
        // Otherwise just fly to the destination
        flyToLocation(destination.center[0], destination.center[1]);
      }
    }
  }, [destination]);

  // Function to calculate route using OSRM
  const calculateRoute = async () => {
    if (!originMarker || !destinationMarker) return;
    
    setLoading(true);
    
    try {
      // Use the OSRM demo server - in production, use your own OSRM server or a service like MapBox
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originMarker.longitude},${originMarker.latitude};${destinationMarker.longitude},${destinationMarker.latitude}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Set route data for displaying on the map
        setRouteData({
          type: "Feature",
          properties: {},
          geometry: route.geometry
        });
        
        // Calculate and format the distance
        const distanceInKm = (route.distance / 1000).toFixed(1);
        setRouteDistance(distanceInKm);
        
        // Calculate and format the duration
        const durationInMinutes = Math.round(route.duration / 60);
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;
        
        if (hours > 0) {
          setRouteDuration(`${hours} hr ${minutes} min`);
        } else {
          setRouteDuration(`${minutes} min`);
        }
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fly to a specific location
  const flyToLocation = (longitude, latitude) => {
    if (mapRef.current) {
      mapRef.current.getMap().flyTo({
        center: [longitude, latitude],
        zoom: 14,
        duration: 2000
      });
    }
  };

  // Function to fit map to show both markers
  const fitMapToMarkers = () => {
    if (mapRef.current && originMarker && destinationMarker) {
      const map = mapRef.current.getMap();
      
      const bounds = [
        [originMarker.longitude, originMarker.latitude],
        [destinationMarker.longitude, destinationMarker.latitude]
      ];
      
      map.fitBounds(bounds, {
        padding: 100,
        duration: 2000
      });
    }
  };

  // Layer style for the route
  const routeLayerStyle = {
    id: 'route',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#4285F4',
      'line-width': 4,
      'line-opacity': 0.8
    }
  };

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={viewState}
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
          showUserHeading={true}
        />
        
        {/* Origin Marker */}
        {originMarker && (
          <Marker 
            longitude={originMarker.longitude} 
            latitude={originMarker.latitude}
            anchor="bottom"
            color="#0000FF"
          />
        )}
        
        {/* Destination Marker */}
        {destinationMarker && (
          <Marker 
            longitude={destinationMarker.longitude} 
            latitude={destinationMarker.latitude}
            anchor="bottom"
            color="#FF0000"
          />
        )}
        
        {/* Route Line */}
        {routeData && (
          <Source id="route-source" type="geojson" data={routeData}>
            <Layer {...routeLayerStyle} />
          </Source>
        )}
      </Map>
      
      {/* Route Info Panel */}
      {routeData && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-10">
          <h3 className="font-bold text-lg mb-2">Route Information</h3>
          <div className="text-sm">
            <p className="mb-1"><span className="font-medium">Distance:</span> {routeDistance} km</p>
            <p><span className="font-medium">Duration:</span> {routeDuration}</p>
          </div>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-70 p-4 rounded-lg shadow-lg z-10">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Calculating route...</span>
          </div>
        </div>
      )}
    </>
  );
}

export default MapComponent;