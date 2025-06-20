import { BodyRelativeDirection, GetRoute, IOSRMEngine, Itinerary, Leg, RoutingAdapter, RoutingRequest, Step, StepType, TransportationMode, WindRoseDirection } from '../../types/mapTypes';

export type OSRMAdapterConfig = {
  profile: string,
}
export class OSRMAdapter implements RoutingAdapter {

  private osrmEndpointBaseUrl: URL;
  private settings: OSRMAdapterConfig | null = null;

  /**
   * 
   * @param osrmEndpointUrl base url of the OSMR endpoint e.g. https://router.project-osrm.org
   */
  constructor(osrmEndpointUrl: URL | string, osrmSettings?: OSRMAdapterConfig) {
    if (typeof osrmEndpointUrl === "string") {
      this.osrmEndpointBaseUrl = new URL(osrmEndpointUrl)
    } else {
      this.osrmEndpointBaseUrl = osrmEndpointUrl;
    }

    if (osrmSettings !== undefined) {
      this.settings = osrmSettings
    }
  }

  /**
   * Returning @see OSRMAdapterConfig object if provided upon constructing the class instance of @see OSRMAdapter or null otherweise
   */
  get osrmSettings() {
    return this.settings;
  }

  get endpointURL() {
    return this.osrmEndpointBaseUrl;
  }

  public async getRoute(options: RoutingRequest): Promise<Itinerary[]> {
    const response = await fetch(
      `${this.osrmEndpointBaseUrl}/route/v1${(this.settings !== null ? "/" + this.settings.profile : "")}/${options.origin.longitude},${options.origin.latitude};${options.destination.longitude},${options.destination.latitude}?overview=full&geometries=geojson`
    );

    const data = await response.json();
    const itineraries: Itinerary[] = [];

    // for (const jsonItinerary of data.routes) {
    //   itineraries.push(this.parseItinerary(jsonItinerary, options))
    // }

    return itineraries;
  }

  private parseWindRoseAngleToWindRoseName(angle: number): WindRoseDirection {

    function isInRange(n: number, min: number, max: number) {
      return min <= n && n < max;
    }

    // data taken from https://commons.wikimedia.org/wiki/File:Compass-rose-32-pt.svg
    if (isInRange(angle, 0, 22.5)) {
      return WindRoseDirection.NORTH;
    } else if (isInRange(angle, 22.5, 67.5)) {
      return WindRoseDirection.NORTHEAST;
    } else if (isInRange(angle, 67.5, 112.5)) {
      return WindRoseDirection.EAST;
    } else if (isInRange(angle, 112.5, 157.5)) {
      return WindRoseDirection.SOUTHEAST;
    } else if (isInRange(angle, 157.5, 202.5)) {
      return WindRoseDirection.SOUTH;
    } else if (isInRange(angle, 202.5, 247.5)) {
      return WindRoseDirection.SOUTHWEST;
    } else if (isInRange(angle, 247.5, 292.5)) {
      return WindRoseDirection.WEST;
    } else if (isInRange(angle, 292.5, 337.5)) {
      return WindRoseDirection.NORTHWEST;
    } else if (isInRange(angle, 337.5, 360)) {
      return WindRoseDirection.NORTH;
    }

    // will only be called when angle has a numberic value outside the wind rose range, just there to pl
    return WindRoseDirection.UNKNOWN;
  }

  private parseStep(jsonStep: any): Step {
    const step: Step = {
      bodyRelativeDirection: jsonStep.maneuver.modifier,
      windRoseDirection: this.parseWindRoseAngleToWindRoseName(jsonStep.maneuver.bearing_after),
      from: null,
      to: null,
      name: jsonStep.name,
      stepType: StepType.TURN
    }

    // cast the OSRM relativeDirection types to our BodyRelativeDirection enum and where necessary to our StepType enum
    switch (jsonStep.relativeDirection) {
      case "slight right":
      case "sharp right":
      case "right":
        step.bodyRelativeDirection = BodyRelativeDirection.RIGHT;
        break;

      case "slight left":
      case "sharp left":
      case "left":
        step.bodyRelativeDirection = BodyRelativeDirection.LEFT;
        break;

      case "straight":
        step.bodyRelativeDirection = BodyRelativeDirection.FORWARD;
        break;

      case "depart":
        step.bodyRelativeDirection = BodyRelativeDirection.START;
        break;

      case "arrive":
        step.bodyRelativeDirection = BodyRelativeDirection.END;
        break;

      case "uturn":
        step.stepType = StepType.UTURN;
        break;
    }

    switch (jsonStep.maneuver.type) {
      case "Turn":
      case "turn":
      case "ExitRoundabout": // TODO: introduce a new StepType for exiting a roundabout to tell the user something like `left to exit roundabout' where 'left' is given by the bodyRelativeDirection attribute on the step.
      case "ExitRotary": // TODO: introduce a new StepType for exiting a rotary to tell the user something like `left to exit rotary' where 'left' is given by the bodyRelativeDirection attribute on the step.
        step.stepType = StepType.TURN;
        break;

      case "Rotary": // TODO: introduce a new StepType for it
      case "Roundabout":
      case "RoundaboutTurn":
        step.stepType = StepType.ROUNDABOUT;
        break;
    }

    return step;
  }

  // private parseLeg(jsonLeg: any, options: RoutingRequest): Leg {
  //   return {
  //     name: jsonLeg.summary,
  //     mode: options.modes[0],
  //     steps: (jsonLeg.steps as Array<any>).map((jsonStep) => this.parseStep(jsonStep))

  //   }
  // }

  // private parseItinerary(jsonItinerary: any, options: RoutingRequest): Itinerary {
  //   const startTime: Date = new Date();
  //   const endTime: number = startTime.getSeconds() + jsonItinerary.duration;

  //   return {
  //     duration: jsonItinerary.duration,
  //     startTime: new Date(),
  //     endTime: new Date(endTime),
  //     legs: (jsonItinerary.legs as Array<any>).map((jsonLeg) => this.parseLeg(jsonLeg, options)),
  //     distance: jsonItinerary.distance,
  //     geometry: jsonItinerary.geometry.coordinates,
  //     plan: jsonItinerary.geometry.coordinates,
  //   }
  // }

}

// export const createOSRMAdapter = (): IOSRMEngine => {
//   return {
//     getRoute: async (
//       origin: { longitude: number; latitude: number },
//       destination: { longitude: number; latitude: number },
//       options?: {
//         arriveBy?: boolean;
//         wheelChair?: boolean;
//       }
//     ): Promise<{
//       geometry: any,
//       distance: number,
//       duration: number
//     }> => {
//       const response = await fetch(
//         `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
//       );

//       const data = await response.json();

//       if (data.routes && data.routes.length > 0) {
//         const route = data.routes[0];
//         return {
//           geometry: route.geometry,
//           distance: route.distance,
//           duration: route.duration,
//         };
//       }

//       throw new Error("No route found");
//     }
//   };
// };
