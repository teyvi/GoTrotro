import {
  RoutingAdapter,
  RoutingRequest,
  Itinerary,
  Leg,
  Step,
  TransportationMode,
  WindRoseDirection,
  BodyRelativeDirection,
  StepType
} from '../../types/mapTypes';

export type ValhallaAdapterConfig = {
  costing?: string; // auto, bicycle, pedestrian, etc.
}

export class ValhallaAdapter implements RoutingAdapter {
  private valhallaEndpointURL: URL;
  private settings: ValhallaAdapterConfig | null = null;

  /**
   * @param valhallaEndpointUrl base url of the Valhalla endpoint e.g. https://valhalla1.openstreetmap.de
   */
  constructor(valhallaEndpointUrl: URL | string, valhallaSettings?: ValhallaAdapterConfig) {
    if (typeof valhallaEndpointUrl === "string") {
      this.valhallaEndpointURL = new URL(valhallaEndpointUrl);
    } else {
      this.valhallaEndpointURL = valhallaEndpointUrl;
    }

    if (valhallaSettings !== undefined) {
      this.settings = valhallaSettings;
    }
  }

  get valhallaSettings() {
    return this.settings;
  }

  get endpointURL() {
    return this.valhallaEndpointURL;
  }

  private mapTransportationModeToCosting(mode: TransportationMode): string {
    switch (mode) {
      case TransportationMode.CAR:
        return 'auto';
      case TransportationMode.BICYCLE:
        return 'bicycle';
      case TransportationMode.WALK:
        return 'pedestrian';
      default:
        return 'auto';
    }
  }

  public async getRoute(options: RoutingRequest): Promise<Itinerary[]> {
    const costing = this.settings?.costing || 
      (options.modes && options.modes.length > 0 
        ? this.mapTransportationModeToCosting(options.modes[0]) 
        : 'auto');

    const requestBody: any = {
      locations: [
        { lat: options.origin.latitude, lon: options.origin.longitude },
        { lat: options.destination.latitude, lon: options.destination.longitude }
      ],
      costing: costing,
      directions_options: {
        units: 'kilometers'
      }
    };

    // Handle wheelchair accessibility
    if (options.wheelchair) {
      requestBody.costing_options = {
        [costing]: {
          wheelchair: true
        }
      };
    }

    const response = await fetch(
      `${this.valhallaEndpointURL}/route`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Valhalla API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.trip || !data.trip.legs) {
      throw new Error("No route found");
    }

    const itineraries: Itinerary[] = [];
    itineraries.push(this.parseItinerary(data.trip, options));

    return itineraries;
  }

  private parseWindRoseAngleToWindRoseName(angle: number): WindRoseDirection {
    function isInRange(n: number, min: number, max: number) {
      return min <= n && n < max;
    }

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

    return WindRoseDirection.UNKNOWN;
  }

  private parseStep(jsonManeuver: any): Step {
    const step: Step = {
      bodyRelativeDirection: BodyRelativeDirection.FORWARD,
      windRoseDirection: jsonManeuver.begin_heading !== undefined 
        ? this.parseWindRoseAngleToWindRoseName(jsonManeuver.begin_heading)
        : WindRoseDirection.UNKNOWN,
      from: null,
      to: null,
      name: jsonManeuver.street_names?.join(', ') || jsonManeuver.instruction || "",
      stepType: StepType.TURN
    };

    // Map Valhalla maneuver types to our types
    // Valhalla types: https://valhalla.github.io/valhalla/api/turn-by-turn/api-reference/
    switch (jsonManeuver.type) {
      case 1: // kStart
        step.bodyRelativeDirection = BodyRelativeDirection.START;
        break;
      case 4: // kDestination
        step.bodyRelativeDirection = BodyRelativeDirection.END;
        break;
      case 10: // kSlightRight
      case 15: // kRight
      case 16: // kSharpRight
        step.bodyRelativeDirection = BodyRelativeDirection.RIGHT;
        step.stepType = StepType.TURN;
        break;
      case 9: // kSlightLeft
      case 7: // kLeft
      case 6: // kSharpLeft
        step.bodyRelativeDirection = BodyRelativeDirection.LEFT;
        step.stepType = StepType.TURN;
        break;
      case 8: // kContinue
      case 2: // kStartRight
      case 3: // kStartLeft
        step.bodyRelativeDirection = BodyRelativeDirection.FORWARD;
        break;
      case 26: // kRoundaboutEnter
      case 27: // kRoundaboutExit
        step.stepType = StepType.ROUNDABOUT;
        break;
      case 17: // kUturnRight
        step.stepType = StepType.UTURN;
        step.bodyRelativeDirection = BodyRelativeDirection.RIGHT;
        break;
      case 18: // kUturnLeft
        step.stepType = StepType.UTURN;
        step.bodyRelativeDirection = BodyRelativeDirection.LEFT;
        break;
    }

    return step;
  }

  private parseLeg(jsonLeg: any, options: RoutingRequest): Leg {
    const steps: Step[] = [];
    
    if (jsonLeg.maneuvers && Array.isArray(jsonLeg.maneuvers)) {
      for (const maneuver of jsonLeg.maneuvers) {
        steps.push(this.parseStep(maneuver));
      }
    }

    const leg: any = {
      name: jsonLeg.summary?.length ? `${jsonLeg.summary.length.toFixed(2)} km` : "Route",
      mode: options.modes && options.modes.length > 0 ? options.modes[0] : TransportationMode.CAR,
      steps: steps,
      routeLongName: jsonLeg.summary?.length ? `${jsonLeg.summary.length.toFixed(2)} km` : "",
      routeId: "",
      to: "",
      from: "",
      duration: jsonLeg.summary?.time || 0,
    };
    return leg as Leg;
  }

  private parseItinerary(jsonTrip: any, options: RoutingRequest): Itinerary {
    const startTime = new Date();
    const duration = jsonTrip.summary?.time || 0;
    const endTime = new Date(startTime.getTime() + duration * 1000);

    const legs: Leg[] = [];
    const geometryCoordinates: [number, number][] = [];

    if (jsonTrip.legs && Array.isArray(jsonTrip.legs)) {
      for (const jsonLeg of jsonTrip.legs) {
        legs.push(this.parseLeg(jsonLeg, options));
        
        // Decode Valhalla's encoded polyline if present
        if (jsonLeg.shape) {
          const decoded = this.decodePolyline(jsonLeg.shape);
          geometryCoordinates.push(...decoded);
        }
      }
    }

    return {
      duration: duration,
      startTime: startTime,
      endTime: endTime,
      legs: legs,
      distance: jsonTrip.summary?.length ? jsonTrip.summary.length * 1000 : 0, // Convert km to meters
      // @ts-expect-error - geometry format is correct
      geometry: geometryCoordinates,
      plan: JSON.stringify(geometryCoordinates),
    };
  }

  /**
   * Decodes Valhalla's polyline encoding (precision 6)
   * Based on: https://github.com/valhalla/valhalla/blob/master/docs/decoding.md
   */
  private decodePolyline(encoded: string, precision: number = 6): [number, number][] {
    const coordinates: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    const factor = Math.pow(10, precision);

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;

      // Decode latitude
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      // Decode longitude
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lng / factor, lat / factor]);
    }

    return coordinates;
  }
}
