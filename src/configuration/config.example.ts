/**
 * Example Configuration File for GoTrotro
 * 
 * This file demonstrates how developers can configure their routing engines
 * and geocoding services by choosing different adapters.
 * 
 * Copy this file to config.ts and customize it for your needs.
 */

import { AppConfiguration } from "./template";
import { OtpAdapter } from "../adapters/routingEngines/OtpAdapter";
import { OSRMAdapter } from "../adapters/routingEngines/OsrmAdapter";
import { ValhallaAdapter } from "../adapters/routingEngines/VahallaAdapter";
import { NominatimAdapter } from "../adapters/geocoders/NominatimAdapter";
import { PhotonAdapter } from "../adapters/geocoders/PhotonAdapter";

/**
 * EXAMPLE 1: Using OTP for routing and Nominatim for geocoding (Default)
 */
export const exampleConfig1: AppConfiguration = {
  appName: "MyTransitApp",
  
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter("http://localhost:8080/otp/routers/default/plan")
  },
  
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter(
      "https://nominatim.openstreetmap.org",
      {
        userAgent: "MyTransitApp",
        email: "contact@mytransitapp.com",
        minRequestInterval: 1500
      }
    )
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};

/**
 * EXAMPLE 2: Using OSRM for routing and Photon for geocoding
 */
export const exampleConfig2: AppConfiguration = {
  appName: "MyRoutingApp",
  
  defaultRoutingEngine: "osrm",
  routingEngines: {
    "osrm": new OSRMAdapter(
      "https://router.project-osrm.org",
      { profile: "driving" } // Options: driving, bike-regular, foot-walking
    )
  },
  
  defaultGeocoder: "photon",
  geocoders: {
    "photon": new PhotonAdapter("https://photon.komoot.io")
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};

/**
 * EXAMPLE 3: Using Valhalla for routing with custom endpoint
 */
export const exampleConfig3: AppConfiguration = {
  appName: "ValhallaApp",
  
  defaultRoutingEngine: "valhalla",
  routingEngines: {
    "valhalla": new ValhallaAdapter(
      "https://valhalla1.openstreetmap.de",
      { costing: "bicycle" } // Options: auto, bicycle, pedestrian, etc.
    )
  },
  
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter("https://nominatim.openstreetmap.org")
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};

/**
 * EXAMPLE 4: Multiple routing engines and geocoders (User can switch between them)
 */
export const exampleConfig4: AppConfiguration = {
  appName: "FlexibleTransitApp",
  
  // Default routing engine
  defaultRoutingEngine: "otp",
  
  // Multiple routing engines available
  routingEngines: {
    "otp": new OtpAdapter(process.env.REACT_APP_OTP_API || "http://localhost:8080/otp/routers/default/plan"),
    "osrm": new OSRMAdapter(
      process.env.REACT_APP_OSRM_API || "https://router.project-osrm.org",
      { profile: "driving" }
    ),
    "valhalla": new ValhallaAdapter(
      process.env.REACT_APP_VALHALLA_API || "https://valhalla1.openstreetmap.de",
      { costing: "auto" }
    )
  },
  
  // Default geocoder
  defaultGeocoder: "nominatim",
  
  // Multiple geocoders available
  geocoders: {
    "nominatim": new NominatimAdapter(
      process.env.REACT_APP_NOMINATIM_API || "https://nominatim.openstreetmap.org",
      {
        userAgent: "FlexibleTransitApp",
        email: process.env.REACT_APP_NOMINATIM_EMAIL || "contact@example.com",
        minRequestInterval: 1500
      }
    ),
    "photon": new PhotonAdapter(
      process.env.REACT_APP_PHOTON_API || "https://photon.komoot.io"
    )
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};

/**
 * EXAMPLE 5: Self-hosted services
 */
export const exampleConfig5: AppConfiguration = {
  appName: "SelfHostedApp",
  
  defaultRoutingEngine: "osrm",
  routingEngines: {
    // Self-hosted OSRM instance
    "osrm": new OSRMAdapter(
      "http://my-osrm-server.com:5000",
      { profile: "car" }
    ),
    // Self-hosted Valhalla instance
    "valhalla": new ValhallaAdapter(
      "http://my-valhalla-server.com:8002"
    )
  },
  
  defaultGeocoder: "photon",
  geocoders: {
    // Self-hosted Photon instance
    "photon": new PhotonAdapter("http://my-photon-server.com:2322")
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};

/**
 * ENVIRONMENT VARIABLES REFERENCE:
 * 
 * Add these to your .env file to configure endpoints:
 * 
 * # Routing Engines
 * REACT_APP_OTP_API=https://api.trotro.app/otp/routers/default/plan
 * REACT_APP_OSRM_API=https://router.project-osrm.org
 * REACT_APP_VALHALLA_API=https://valhalla1.openstreetmap.de
 * 
 * # Geocoding Services
 * REACT_APP_NOMINATIM_API=https://nominatim.openstreetmap.org
 * REACT_APP_NOMINATIM_EMAIL=your-email@example.com
 * REACT_APP_PHOTON_API=https://photon.komoot.io
 */

