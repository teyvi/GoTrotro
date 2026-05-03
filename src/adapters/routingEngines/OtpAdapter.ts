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
import { decodePolyline } from '../../utils/polylineDecoder';

export class OtpAdapter implements RoutingAdapter {

  private otpEndpointURL: URL;
  private static DEFAULT_MAX_WALK_DISTANCE = 3500;

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
    const TransportationModeMap: Record<number, string> = {
      [TransportationMode.TRANSIT]: "TRANSIT",
      [TransportationMode.WALK]: "WALK",
    }

    const params = new URLSearchParams({
      fromPlace: `${options.origin.latitude},${options.origin.longitude}`,
      toPlace: `${options.destination.latitude},${options.destination.longitude}`,
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      date: `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}`,
      mode: options.modes
        ? options.modes.map((mode) => TransportationModeMap[mode]).join(",")
        : "TRANSIT,WALK",
      // TODO: change this once this is configurable either in the app configuration or in the GUI by the user
      maxWalkDistance: OtpAdapter.DEFAULT_MAX_WALK_DISTANCE.toString(),
      arriveBy: "false",
      wheelchair: String(options.wheelchair),
      locale: "en", //TODO: Make aware of multiple languages
      // Request full geometry detail for all legs (may not be supported by all OTP versions)
      showIntermediateStops: "true",
      itinIndex: "0",
    });

    const requestUrl = new URL(this.otpEndpointURL.toString());
    const isRootPath = requestUrl.pathname === "/" || requestUrl.pathname === "";
    const isPlannerModulePath =
      isRootPath && requestUrl.searchParams.get("module") === "planner";
    if (isRootPath || isPlannerModulePath) {
      // Some deployments expose an OTP web UI on "/" and JSON planner at this path.
      requestUrl.pathname = "/otp/routers/default/plan";
      requestUrl.searchParams.delete("module");
    }

    for (const [key, value] of params.entries()) {
      requestUrl.searchParams.set(key, value);
    }

    console.log(requestUrl.toString());

    const response = await fetch(requestUrl.toString());
    if (!response.ok) {
      throw new Error(`OTP API request failed (${response.status})`);
    }
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      throw new TypeError("OTP API endpoint did not return JSON")
    }
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.msg || "OTP API error");
    }

    const itineraries: Itinerary[] = [];
    if (!data.plan?.itineraries) throw new Error("No itinerary");

    for (const jsonItinerary of data.plan.itineraries) {
      itineraries.push(this.parseItinerary(jsonItinerary))
    }

    return itineraries;
  }


  private parseStep(jsonStep: any, geometry: Array<any>): Step {
    const step: Step = {
      bodyRelativeDirection: jsonStep.relativeDirection,
      windRoseDirection: jsonStep.absoluteDirection,
      point: {
        longitude: jsonStep.lon,
        latitude: jsonStep.lat
      },
      name: jsonStep.streetName,
      stepType: StepType.TURN
    }

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
    const leg: any = {
      mode: jsonLeg.mode, // keep as string for UI checks like leg.mode === "WALK"
      name: jsonLeg.route,
      routeLongName: jsonLeg.routeLongName,
      routeId: jsonLeg.routeId,
      to: jsonLeg.to,
      from: jsonLeg.from,
      duration: jsonLeg.duration,
      steps: Array.isArray(jsonLeg.steps)
        ? jsonLeg.steps.map((jsonStep: any) => this.parseStep(jsonStep, geometry))
        : [],
    };

    geometry.push(...decodePolyline(jsonLeg.legGeometry.points));

    // // Preserve legGeometry from raw API response for polyline decoding
    // if (jsonLeg.legGeometry) {
    //   leg.legGeometry = jsonLeg.legGeometry;
    // }

    // Preserve distance from raw API response
    if (jsonLeg.distance !== undefined) {
      leg.distance = jsonLeg.distance;
    }

    return leg as Leg;
  }

  private parseItinerary(jsonItinerary: any): Itinerary {
    let geometry: Array<any> = [];

    return {
      plan: JSON.stringify(jsonItinerary),
      duration: jsonItinerary.duration,
      startTime: new Date(jsonItinerary.startTime),
      endTime: new Date(jsonItinerary.endTime),
      legs: Array.isArray(jsonItinerary.legs)
        ? jsonItinerary.legs.map((jsonLeg: any) => this.parseLeg(jsonLeg, geometry))
        : [],
      distance: jsonItinerary.walkDistance,
      transfers: jsonItinerary.transfers ?? 0,
      walkDistance: jsonItinerary.walkDistance ?? 0,
      geometry: geometry,
    };
  }
}