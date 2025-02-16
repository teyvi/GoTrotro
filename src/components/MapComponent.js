import * as React from "react";
import {
  GeolocateControl,
  Map,
  NavigationControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/map.css";

function MapComponent() {
  return (
    <Map
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
        showUserHeading={true}
      />
    </Map>
  );
}

export default MapComponent;
