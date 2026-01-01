import { RoutingAdapter, GeocoderAdapter } from "../types/mapTypes"

export type AppConfiguration = {
  appName: string,

  defaultRoutingEngine: string,
  routingEngines: {
    [key: string]: RoutingAdapter,
  }

  defaultGeocoder: string,
  geocoders: {
    [key: string]: GeocoderAdapter,
  }

  defaultMapStyle: string,
  mapStyles: {
    [key: string]: string,
  },
}