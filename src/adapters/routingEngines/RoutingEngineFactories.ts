// import { IOSRMEngine, IOTPEngine, IValhallaEngine } from './../../types/mapTypes';
// import { createOTPAdapter } from './OtpAdapter';
// import { createOSRMAdapter } from './OsrmAdapter';
// import { createValhallaAdapter } from './VahallaAdapter';

// // TODO: question this and come up with a more generalized approach

// type EngineType = 'OSRM' | 'OTP' | 'Valhalla'

// type EngineTypeMap = {
//   OSRM: IOSRMEngine,
//   OTP: IOTPEngine,
//   Valhalla: IValhallaEngine
// }

// export const RoutingEngineFactory = <T extends EngineType>(engineType: T): EngineTypeMap[T] => {
//   switch (engineType) {
//     case 'OSRM':
//       return createOSRMAdapter() as EngineTypeMap[T];
//     case 'OTP':
//       return createOTPAdapter() as EngineTypeMap[T];
//     case 'Valhalla':
//       return createValhallaAdapter() as EngineTypeMap[T];
//     default:
//       throw new Error(`Unsupported routing engine: ${engineType}`);
//   }
// };

