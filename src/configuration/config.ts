import { AppConfiguration } from "./template";
import { OtpAdapter } from "../adapters/routingEngines/OtpAdapter"

const appConfiguration: AppConfiguration = {
  appName: "GoTrotro",
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter((process.env.REACT_APP_OTP_API === undefined ? '' : process.env.REACT_APP_OTP_API))
  },
  defaultMapStyle: "",
  mapStyles: {}
}

export { appConfiguration };