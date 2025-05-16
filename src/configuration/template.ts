import { RoutingAdapter } from "../types/mapTypes"

export type AppConfiguration = {
  defaultRoutingEngine: string,
  routingEngines: {
    [key: string]: RoutingAdapter,
  }

  appName: string,

  defaultMapStyle: string,
  mapStyles: {
    [key: string]: string,
  },
}