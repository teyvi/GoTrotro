import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


const defaultIcon = new Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

function MapComponent() {
    const position = [5.614818, -0.205874];  // Nairobi coordinates


    return (
        <>
            <MapContainer 
      center={position} 
      zoom={13} 
      style={{ height: "calc(100vh - 20px)", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <Marker position={position} icon={defaultIcon}>
        <Popup>
          A sample location
        </Popup>
      </Marker> */}
    </MapContainer>
     
        </>
    );
}

export default MapComponent;