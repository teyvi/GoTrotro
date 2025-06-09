 import {
  RoutingRequest,
  Itinerary,
  Leg,
  Step,
  TransportationMode,
  WindRoseDirection,
  BodyRelativeDirection,
  StepType,
  RoutingAdapter
} from '../../types/mapTypes';

export class OtpAdapter implements RoutingAdapter {

  private otpEndpointURL: URL;
  private static DEFAULT_MAX_WALK_DISTANCE = 0.5;

  constructor(otpEndpointURL: URL | string) {
    if (typeof otpEndpointURL === "string") {
      this.otpEndpointURL = new URL(otpEndpointURL)
    } else {
      this.otpEndpointURL = otpEndpointURL;
    }
  }

  get endpointURL() {
    return this.otpEndpointURL
  }

  public async getRoute(options: RoutingRequest): Promise<Itinerary[]> {
    const now = new Date();

    const params = new URLSearchParams({
      fromPlace: `${options.origin.latitude},${options.origin.longitude}`,
      toPlace: `${options.destination.latitude},${options.destination.longitude}`,
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      date: `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}`,
      mode: "TRANSIT", // TODO: change this once this is configurable either in the app configuration or in the GUI by the user
      maxWalkDistance: OtpAdapter.DEFAULT_MAX_WALK_DISTANCE.toString(),
      arriveBy: "false",
      wheelchair: String(options.wheelchair),
      locale: "en", //TODO: Make aware of multiple languages
    });

    const response = await fetch(`${this.otpEndpointURL}?${params}`);
    if (response.headers.get("Content-Type") !== "application/json") {
      throw new TypeError("OTP API endpoint did not return JSON")
    }
    const data = await response.json();

    const itineraries: Itinerary[] = [];
    if(data.plan.Itinerary !== undefined){
      throw new Error ("No itinerary")
    }
    for (const jsonItinerary of data.plan.itineraries) {
      itineraries.push(this.parseItinerary(jsonItinerary))
    }

    return itineraries;

    //   const itinerary = data.plan.itineraries[0];
    //   return {
    //     destination: itinerary.destination,
    //     origin: itinerary.origin,
    //     itineraries: itinerary.itineraries,
    //     primaryItinerary: itinerary.primaryItinerary,
    //   };
    // }

    // export const createOTPAdapter = (): IOTPEngine => {
    //   const formatTime = (date: Date) =>
    //     date
    //       .toLocaleTimeString("en-US", {
    //         hour: "2-digit",
    //         minute: "2-digit",
    //         hour12: true,
    //       })
    //       .toLowerCase();

    //   const formatDate = (date: Date) =>
    //     `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    //       date.getDate()
    //     ).padStart(2, "0")}-${date.getFullYear()}`;

    //   return {

    //   };
    // };
  }

  private parseStep(jsonStep: any, geometry: Array<any>): Step {
    const step: Step = {
      bodyRelativeDirection: jsonStep.relativeDirection,
      windRoseDirection: jsonStep.absoluteDirection,
      from: null,
      to: null,
      name: jsonStep.streetName,
      stepType: StepType.TURN
    }

    geometry.push([jsonStep.lon, jsonStep.lat])

    // see http://dev.opentripplanner.org/apidoc/1.5.0/json_RelativeDirection.html
    // cast the OTP relativeDirection types to our BodyRelativeDirection enum and where necessary to our StepType enum
    switch (jsonStep.relativeDirection) {
      case "SLIGHTLY_RIGHT":
      case "HARD_RIGHT":
      case "RIGHT":
        step.bodyRelativeDirection = BodyRelativeDirection.RIGHT;
        break;

      case "SLIGHTLY_LEFT":
      case "HARD_LEFT":
      case "LEFT":
        step.bodyRelativeDirection = BodyRelativeDirection.LEFT;
        break;

      case "CIRCLE_CLOCKWISE":
        step.stepType = StepType.ROUNDABOUT;
        step.bodyRelativeDirection = BodyRelativeDirection.LEFT;
        break;

      case "CIRCLE_COUNTERCLOCKWISE":
        step.stepType = StepType.ROUNDABOUT;
        step.bodyRelativeDirection = BodyRelativeDirection.RIGHT;
        break;

      case "ELEVATOR":
      case "CONTINUE":
        step.bodyRelativeDirection = BodyRelativeDirection.FORWARD;
        break;

      case "DEPART":
        step.bodyRelativeDirection = BodyRelativeDirection.START;
        break;

      case "UTURN_LEFT":
        step.stepType = StepType.UTURN;
        step.bodyRelativeDirection = BodyRelativeDirection.LEFT;
        break;

      case "UTURN_RIGHT":
        step.stepType = StepType.UTURN;
        step.bodyRelativeDirection = BodyRelativeDirection.RIGHT;
        break;
    }

    // see http://dev.opentripplanner.org/apidoc/1.5.0/json_AbsoluteDirection.html
    // strings there are the same as our enum WindRoseDirection. As long as this is the case we can skip explicit type casting/declaration.
    step.windRoseDirection = (jsonStep.absoluteDirection as unknown as WindRoseDirection)

    return step;
  }

  private parseLeg(jsonLeg: any, geometry: Array<any>): Leg {
    return {
      // strings here are the same as our enum TransportationMode. As long as this is the case we can skip explicit type casting/declaration.
      mode: (jsonLeg.mode as unknown as TransportationMode),
      name: jsonLeg.route,
      steps: (jsonLeg.steps as Array<any>).map((jsonStep) => this.parseStep(jsonStep, geometry))
    }
  }

  private parseItinerary(jsonItinerary: any): Itinerary {
    let geometry: Array<any> = [];

    return {
      duration: jsonItinerary.duration,
      startTime: new Date(jsonItinerary.startTime), // unix epoch format
      endTime: new Date(jsonItinerary.endTime), // unix epoch format
      legs: (jsonItinerary.legs as Array<any>).map((jsonLeg) => this.parseLeg(jsonLeg, geometry)),
      distance: jsonItinerary.walkDistance,
      // @ts-expect-error
      geometry: geometry
    }
  }
}