import { AppConfiguration } from "./template";
import { OtpAdapter } from "../adapters/routingEngines/OtpAdapter";
import { OSRMAdapter } from "../adapters/routingEngines/OsrmAdapter";
import { ValhallaAdapter } from "../adapters/routingEngines/VahallaAdapter";
import { NominatimAdapter } from "../adapters/geocoders/NominatimAdapter";
import { PhotonAdapter } from "../adapters/geocoders/PhotonAdapter";

const appConfiguration: AppConfiguration = {
  appName: "GoTrotro",
  
  // Routing Engine Configuration
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter(
      process.env.REACT_APP_OTP_API || 'https://api.trotro.app/otp/routers/default/plan'
    ),
    "osrm": new OSRMAdapter(
      process.env.REACT_APP_OSRM_API || 'https://router.project-osrm.org',
      { profile: 'driving' }
    ),
    "valhalla": new ValhallaAdapter(
      process.env.REACT_APP_VALHALLA_API || 'https://valhalla1.openstreetmap.de',
      { costing: 'auto' }
    )
  },
  
  // Geocoder Configuration
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter(
      process.env.REACT_APP_NOMINATIM_API || 'https://nominatim.openstreetmap.org',
      {
        userAgent: 'GoTrotro',
        email: process.env.REACT_APP_NOMINATIM_EMAIL || 'angelateyvi@gmail.com',
        minRequestInterval: 1500
      }
    ),
    "photon": new PhotonAdapter(
      process.env.REACT_APP_PHOTON_API || 'https://photon.komoot.io',
      {
        minRequestInterval: 100
      }
    )
  },
  
  // Map Style Configuration
  defaultMapStyle: "",
  mapStyles: {}
}

export { appConfiguration };