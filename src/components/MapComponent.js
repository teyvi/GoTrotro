// import React from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';

function MapComponent() {
  const position = [5.614818, -0.205874];
    const mapContainer = useRef(null);
    const map = useRef(null);
    const accra = { lng: 5.614818, lat: -0.205874 };
    const zoom = 14;
    maptilersdk.config.apiKey = 'YOUR_MAPTILER_API_KEY_HERE';
 

  return (
    <Map
      initialViewState={{
        longitude: position[1],
        latitude: position[0],
        zoom: 10,
      }}
      mapStyle="https://demotiles.maplibre.org/style.json"
      style={{ height: "calc(100vh - 20px)", width: "100%" }}
    />
  );
}

export default MapComponent;
