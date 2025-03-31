import { IRoutingEngine } from "../interfaces/IRoutingEngine";
import { OSRMAdapter } from "./OsrmAdapter"; 
import { OTPAdapter } from "./OtpAdapter";  
import { ValhallaAdapter } from "./VahallaAdapter";  

export default class RoutingEngineFactory {
  static createEngine(engineName: string): IRoutingEngine {
    switch (engineName) {
      case "OSRM":
        return new OSRMAdapter();
      case "OTP":
        return new OTPAdapter();
      case "Valhalla":
        return new ValhallaAdapter();
      default:
        throw new Error("Unsupported routing engine");
    }
  }
}