import * as React from 'react';
import {Map} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

function MapComponent() {
  return (
    <Map
      initialViewState={{
        longitude: -0.205874,
        latitude: 5.614818,
        zoom: 11
      }}
      style={{width: '100%', height: `calc(100vh - 20px)`}}
      mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_TOKEN}`}    />
  );
}

export default MapComponent;