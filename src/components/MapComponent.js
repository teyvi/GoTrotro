// import React from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "../styles/map.css";

function MapComponent() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const accra = { lng:-0.205874 , lat:  5.614818};
    const zoom = 11;
    maptilersdk.config.apiKey = process.env.REACT_APP_MAPTILER_TOKEN;
 

    useEffect(() => {
      if (map.current) return; 
    
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [accra.lng, accra.lat],
        zoom: zoom
      });
    
    }, [accra.lng, accra.lat, zoom]);

  return (

    <div className="map-wrap">
    <div ref={mapContainer} className="map" />
  </div>
  );
}

export default MapComponent;
