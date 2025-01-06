import React from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

function MapComponent() {
  const position = [5.614818, -0.205874];

  return (
    <Map
      initialViewState={{
        longitude: position[1],
        latitude: position[0],
        zoom: 2,
      }}
      mapStyle="https://demotiles.maplibre.org/style.json"
      style={{ height: "calc(100vh - 20px)", width: "100%" }}
    />
  );
}

export default MapComponent;
