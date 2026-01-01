# GoTrotro Adapter Architecture

GoTrotro uses a **pluggable adapter architecture** that allows developers to easily switch between different routing engines and geocoding services at the code level.

## Table of Contents

- [Overview](#overview)
- [Routing Adapters](#routing-adapters)
- [Geocoding Adapters](#geocoding-adapters)
- [Configuration](#configuration)
- [Creating Custom Adapters](#creating-custom-adapters)
- [Examples](#examples)

## Overview

The adapter pattern allows you to:
- ✅ Choose your preferred routing engine (OTP, OSRM, Valhalla, etc.)
- ✅ Choose your preferred geocoding service (Nominatim, Photon, etc.)
- ✅ Use self-hosted or third-party services
- ✅ Switch providers without changing application code
- ✅ Create custom adapters for your own services

## Routing Adapters

### Available Routing Engines

| Engine | Adapter | Best For | Documentation |
|--------|---------|----------|---------------|
| **OTP** (OpenTripPlanner) | `OtpAdapter` | Public transit routing | [OTP Docs](http://docs.opentripplanner.org/) |
| **OSRM** | `OSRMAdapter` | Fast car routing | [OSRM Docs](http://project-osrm.org/) |
| **Valhalla** | `ValhallaAdapter` | Multi-modal routing | [Valhalla Docs](https://valhalla.github.io/valhalla/) |

### OTP Adapter

```typescript
import { OtpAdapter } from "./adapters/routingEngines/OtpAdapter";

const otpAdapter = new OtpAdapter("http://localhost:8080/otp/routers/default/plan");
```

**Features:**
- Transit routing with real-time data
- Walk, bike, and transit combinations
- Wheelchair accessibility support
- Multiple itinerary options

### OSRM Adapter

```typescript
import { OSRMAdapter } from "./adapters/routingEngines/OsrmAdapter";

const osrmAdapter = new OSRMAdapter(
  "https://router.project-osrm.org",
  { profile: "driving" } // Options: driving, bike-regular, foot-walking
);
```

**Features:**
- Ultra-fast car routing
- Multiple routing profiles
- Turn-by-turn directions
- Route geometry

### Valhalla Adapter

```typescript
import { ValhallaAdapter } from "./adapters/routingEngines/VahallaAdapter";

const valhallaAdapter = new ValhallaAdapter(
  "https://valhalla1.openstreetmap.de",
  { costing: "auto" } // Options: auto, bicycle, pedestrian, etc.
);
```

**Features:**
- Multi-modal routing
- Time-dependent routing
- Multiple cost models
- Detailed maneuver instructions

## Geocoding Adapters

### Available Geocoders

| Service | Adapter | Rate Limits | Documentation |
|---------|---------|-------------|---------------|
| **Nominatim** | `NominatimAdapter` | 1 req/sec | [Nominatim Docs](https://nominatim.org/) |
| **Photon** | `PhotonAdapter` | More lenient | [Photon Docs](https://photon.komoot.io/) |

### Nominatim Adapter

```typescript
import { NominatimAdapter } from "./adapters/geocoders/NominatimAdapter";

const nominatimAdapter = new NominatimAdapter(
  "https://nominatim.openstreetmap.org",
  {
    userAgent: "MyApp",
    email: "contact@myapp.com",
    minRequestInterval: 1500 // milliseconds between requests
  }
);
```

**Features:**
- Comprehensive OSM data
- Address details
- Reverse geocoding
- Automatic rate limiting

### Photon Adapter

```typescript
import { PhotonAdapter } from "./adapters/geocoders/PhotonAdapter";

const photonAdapter = new PhotonAdapter("https://photon.komoot.io");
```

**Features:**
- Fast geocoding
- Based on OSM data
- No authentication required
- Higher rate limits

## Configuration

### Basic Configuration

Edit `src/configuration/config.ts`:

```typescript
import { AppConfiguration } from "./template";
import { OtpAdapter } from "../adapters/routingEngines/OtpAdapter";
import { NominatimAdapter } from "../adapters/geocoders/NominatimAdapter";

const appConfiguration: AppConfiguration = {
  appName: "MyApp",
  
  // Choose your routing engine
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter("http://your-otp-server.com/plan")
  },
  
  // Choose your geocoder
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter(
      "https://nominatim.openstreetmap.org",
      {
        userAgent: "MyApp",
        email: "contact@myapp.com"
      }
    )
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};

export { appConfiguration };
```

### Using Environment Variables

Create a `.env` file:

```bash
# Routing Engines
REACT_APP_OTP_API=http://localhost:8080/otp/routers/default/plan
REACT_APP_OSRM_API=https://router.project-osrm.org
REACT_APP_VALHALLA_API=https://valhalla1.openstreetmap.de

# Geocoding Services
REACT_APP_NOMINATIM_API=https://nominatim.openstreetmap.org
REACT_APP_NOMINATIM_EMAIL=your-email@example.com
REACT_APP_PHOTON_API=https://photon.komoot.io
```

Then reference in config:

```typescript
const appConfiguration: AppConfiguration = {
  appName: "MyApp",
  
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter(
      process.env.REACT_APP_OTP_API || "http://localhost:8080/otp/routers/default/plan"
    )
  },
  
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter(
      process.env.REACT_APP_NOMINATIM_API || "https://nominatim.openstreetmap.org",
      {
        email: process.env.REACT_APP_NOMINATIM_EMAIL
      }
    )
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};
```

### Multiple Adapters

Configure multiple adapters and switch between them programmatically:

```typescript
const appConfiguration: AppConfiguration = {
  appName: "MyApp",
  
  // Multiple routing engines
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter("http://otp-server.com/plan"),
    "osrm": new OSRMAdapter("https://router.project-osrm.org", { profile: "driving" }),
    "valhalla": new ValhallaAdapter("https://valhalla1.openstreetmap.de")
  },
  
  // Multiple geocoders
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter("https://nominatim.openstreetmap.org"),
    "photon": new PhotonAdapter("https://photon.komoot.io")
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};

// Access a specific engine
const engine = appConfiguration.routingEngines["osrm"];
const routes = await engine.getRoute({ /* options */ });

// Access a specific geocoder
const geocoder = appConfiguration.geocoders["photon"];
const results = await geocoder.search("Accra, Ghana");
```

## Creating Custom Adapters

### Custom Routing Adapter

Implement the `RoutingAdapter` interface:

```typescript
import { RoutingAdapter, RoutingRequest, Itinerary } from "../../types/mapTypes";

export class MyCustomRoutingAdapter implements RoutingAdapter {
  private endpointURL: URL;

  constructor(endpointUrl: string) {
    this.endpointURL = new URL(endpointUrl);
  }

  async getRoute(options: RoutingRequest): Promise<Itinerary[]> {
    // Your implementation here
    const response = await fetch(`${this.endpointURL}/route`, {
      method: 'POST',
      body: JSON.stringify(options)
    });
    
    const data = await response.json();
    
    // Transform to Itinerary[] format
    return this.parseItineraries(data);
  }

  private parseItineraries(data: any): Itinerary[] {
    // Parse your API response to match Itinerary[] format
    // See existing adapters for examples
    return [];
  }
}
```

### Custom Geocoding Adapter

Implement the `GeocoderAdapter` interface:

```typescript
import { GeocoderAdapter, GeocoderSearchOptions, LocationResult } from "../../types/mapTypes";

export class MyCustomGeocoderAdapter implements GeocoderAdapter {
  private endpointURL: URL;

  constructor(endpointUrl: string) {
    this.endpointURL = new URL(endpointUrl);
  }

  async search(query: string, options?: GeocoderSearchOptions): Promise<LocationResult[]> {
    // Your implementation here
    const response = await fetch(`${this.endpointURL}/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    // Transform to LocationResult[] format
    return this.parseResults(data);
  }

  private parseResults(data: any): LocationResult[] {
    // Parse your API response to match LocationResult[] format
    return data.map((item: any) => ({
      place_name: item.name,
      coordinates: [item.lon, item.lat],
      center: [item.lon, item.lat],
      latitude: item.lat,
      longitude: item.lon,
      id: item.id,
      properties: item
    }));
  }
}
```

## Examples

See `src/configuration/config.example.ts` for complete configuration examples:

1. **OTP + Nominatim** - Default transit routing setup
2. **OSRM + Photon** - Fast car routing with alternative geocoder
3. **Valhalla** - Multi-modal routing setup
4. **Multiple Adapters** - Configure all options
5. **Self-hosted Services** - Use your own infrastructure

## Best Practices

1. **Rate Limiting**: Always configure appropriate rate limits for public geocoding services
2. **Error Handling**: Adapters throw errors that should be caught and handled appropriately
3. **Environment Variables**: Use environment variables for endpoint URLs to easily switch between dev/prod
4. **Custom Adapters**: Follow the interface contracts exactly to ensure compatibility
5. **User Agents**: When using Nominatim, always set a proper user agent with contact information

## Troubleshooting

### Routing Issues

- **No route found**: Check that your routing engine is properly configured and accessible
- **Wrong mode**: Ensure the transportation mode is supported by your chosen engine
- **CORS errors**: If using a self-hosted service, ensure CORS is properly configured

### Geocoding Issues

- **Rate limit errors**: Adjust `minRequestInterval` in adapter configuration
- **No results**: Try a different geocoder (Photon vs Nominatim may have different data)
- **Wrong country**: Set the `countryCode` option in search options

## API Reference

### RoutingAdapter Interface

```typescript
interface RoutingAdapter {
  getRoute(options: RoutingRequest): Promise<Itinerary[]>;
}
```

### GeocoderAdapter Interface

```typescript
interface GeocoderAdapter {
  search(query: string, options?: GeocoderSearchOptions): Promise<LocationResult[]>;
}
```

### Types

See `src/types/mapTypes.ts` for complete type definitions:
- `RoutingRequest`
- `Itinerary`
- `Leg`
- `Step`
- `LocationResult`
- `GeocoderSearchOptions`

## Contributing

To add support for a new routing engine or geocoding service:

1. Create a new adapter class in the appropriate directory
2. Implement the required interface (`RoutingAdapter` or `GeocoderAdapter`)
3. Add tests for your adapter
4. Update this documentation
5. Submit a pull request

## License

[Your License Here]

