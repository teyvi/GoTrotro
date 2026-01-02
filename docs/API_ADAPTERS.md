# API Adapters Guide

This guide explains how to work with, extend, and create adapters for routing engines and geocoding services in GoTrotro.

## Table of Contents

- [Overview](#overview)
- [Routing Adapters](#routing-adapters)
- [Geocoding Adapters](#geocoding-adapters)
- [Creating a New Adapter](#creating-a-new-adapter)
- [Testing Adapters](#testing-adapters)
- [Adapter Best Practices](#adapter-best-practices)

---

## Overview

The adapter pattern is the core architectural pattern in GoTrotro. It allows the application to work with multiple routing engines and geocoding services through a unified interface.

### Why Adapters?

**Problem**: Different services have different APIs
- OTP returns XML/JSON with nested objects
- OSRM returns JSON with encoded polylines  
- Valhalla uses different field names
- Nominatim and Photon have different response structures

**Solution**: Adapters translate between service-specific formats and our unified types

```
Application Code (uses unified types)
        ↓
    Adapter Interface (defines contract)
        ↓
Specific Adapter (implements translation)
        ↓
External API (service-specific format)
```

---

## Routing Adapters

All routing adapters implement the `RoutingAdapter` interface:

```typescript
export interface RoutingAdapter {
  getRoute(request: RoutingRequest): Promise<Itinerary[]>;
}
```

### Unified Types

#### Input: `RoutingRequest`

```typescript
{
  origin: {
    latitude: number,
    longitude: number
  },
  destination: {
    latitude: number,
    longitude: number
  },
  modes: TransportationMode[],  // [TRANSIT, WALK, BICYCLE, CAR]
  wheelchair: boolean
}
```

#### Output: `Itinerary[]`

```typescript
{
  duration: number,         // Total duration in seconds
  startTime: Date,
  endTime: Date,
  legs: Leg[],             // Individual segments
  distance: number,        // Total distance in meters
  walkDistance: number,
  transfers: number        // Number of transfers
}
```

### OTP Adapter

Location: `src/adapters/routingEngines/OtpAdapter.ts`

**Purpose**: Connects to OpenTripPlanner for transit routing

**Example Usage**:
```typescript
const adapter = new OtpAdapter(
  'http://localhost:8080/otp/routers/default/plan'
);

const itineraries = await adapter.getRoute({
  origin: { latitude: 5.57, longitude: -0.13 },
  destination: { latitude: 5.56, longitude: -0.21 },
  modes: [TransportationMode.TRANSIT, TransportationMode.WALK],
  wheelchair: false
});
```

**Key Methods**:
- `getRoute()` - Main entry point
- `parseItinerary()` - Converts OTP itinerary to unified format
- `parseLeg()` - Converts OTP leg to unified format
- `parseStep()` - Converts OTP step to unified format

**Translation Logic**:
```typescript
// OTP response
{
  plan: {
    itineraries: [{
      legs: [{
        mode: "BUS",
        route: "425",
        from: { lat: 5.57, lon: -0.13, name: "Gas" },
        to: { lat: 5.56, lon: -0.21, name: "Circle" },
        duration: 2583,
        legGeometry: { points: "encoded_polyline..." }
      }]
    }]
  }
}

// Becomes
{
  duration: 2583,
  legs: [{
    mode: TransportationMode.BUS,
    name: "425",
    from: { name: "Gas", ... },
    to: { name: "Circle", ... },
    duration: 2583,
    legGeometry: { points: "encoded_polyline..." }
  }]
}
```

### OSRM Adapter

Location: `src/adapters/routingEngines/OsrmAdapter.ts`

**Purpose**: Connects to OSRM for road routing

**Example Usage**:
```typescript
const adapter = new OSRMAdapter(
  'https://router.project-osrm.org',
  { profile: 'driving', steps: true }
);

const itineraries = await adapter.getRoute(request);
```

**Key Differences from OTP**:
- No transit data (road routing only)
- Uses encoded polylines for geometry
- Returns turn-by-turn instructions
- Faster but less detailed than OTP for pedestrian/transit

**Translation Logic**:
```typescript
// OSRM response
{
  routes: [{
    legs: [{
      steps: [...],
      distance: 9550.58,
      duration: 1200,
      summary: "Main St, Highway 1"
    }],
    geometry: "encoded_polyline...",
    duration: 1200,
    distance: 9550.58
  }]
}

// Becomes unified Itinerary format
```

### Valhalla Adapter

Location: `src/adapters/routingEngines/ValhallaAdapter.ts`

**Purpose**: Connects to Valhalla for multi-modal routing

**Example Usage**:
```typescript
const adapter = new ValhallaAdapter(
  'https://valhalla1.openstreetmap.de',
  { costing: 'pedestrian' }
);

const itineraries = await adapter.getRoute(request);
```

**Key Features**:
- Multi-modal support (car, bike, pedestrian)
- Detailed maneuvers and instructions
- Configurable costs and penalties

---

## Geocoding Adapters

All geocoding adapters implement the `GeocoderAdapter` interface:

```typescript
export interface GeocoderAdapter {
  search(query: string, options?: GeocoderSearchOptions): Promise<LocationResult[]>;
}
```

### Unified Types

#### Input: `GeocoderSearchOptions`

```typescript
{
  limit?: number,          // Max number of results
  countryCode?: string,    // e.g., "gh" for Ghana
  language?: string        // e.g., "en"
}
```

#### Output: `LocationResult[]`

```typescript
{
  place_name: string,      // Display name
  coordinates: [number, number],  // [longitude, latitude]
  center: [number, number],
  latitude: number,
  longitude: number,
  properties: {            // Additional metadata
    country?: string,
    city?: string,
    // ...
  }
}
```

### Nominatim Adapter

Location: `src/adapters/geocoders/NominatimAdapter.ts`

**Purpose**: OSM-based geocoding (most comprehensive)

**Example Usage**:
```typescript
const adapter = new NominatimAdapter(
  'https://nominatim.openstreetmap.org',
  {
    userAgent: 'GoTrotro/1.0',
    email: 'your@email.com',
    minRequestInterval: 1500
  }
);

const results = await adapter.search('Madina, Accra', {
  limit: 10,
  countryCode: 'gh',
  language: 'en'
});
```

**Key Features**:
- Comprehensive OSM data
- Requires user agent and email
- Rate limited (1 request/second)
- Includes detailed address components

**Translation Logic**:
```typescript
// Nominatim response
[{
  place_id: 123,
  display_name: "Madina, Accra, Greater Accra, Ghana",
  lat: "5.6789",
  lon: "-0.1234",
  address: {
    suburb: "Madina",
    city: "Accra",
    country: "Ghana"
  }
}]

// Becomes
[{
  place_name: "Madina, Accra, Greater Accra, Ghana",
  coordinates: [-0.1234, 5.6789],
  center: [-0.1234, 5.6789],
  latitude: 5.6789,
  longitude: -0.1234,
  properties: {
    suburb: "Madina",
    city: "Accra",
    country: "Ghana"
  }
}]
```

### Photon Adapter

Location: `src/adapters/geocoders/PhotonAdapter.ts`

**Purpose**: Fast geocoding alternative

**Example Usage**:
```typescript
const adapter = new PhotonAdapter(
  'https://photon.komoot.io',
  { minRequestInterval: 100 }
);

const results = await adapter.search('Circle, Accra');
```

**Key Features**:
- Very fast
- More permissive rate limits
- Based on OSM data but indexed differently
- Good for autocomplete

---

## Creating a New Adapter

### Step 1: Implement the Interface

For a routing adapter:

```typescript
import { RoutingAdapter, RoutingRequest, Itinerary } from '../../types/mapTypes';

export class MyRoutingAdapter implements RoutingAdapter {
  private apiUrl: string;
  private options: any;

  constructor(apiUrl: string, options: any = {}) {
    this.apiUrl = apiUrl;
    this.options = options;
  }

  async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
    // 1. Translate request to API format
    const apiRequest = this.buildApiRequest(request);
    
    // 2. Call external API
    const response = await fetch(`${this.apiUrl}?${apiRequest}`);
    const data = await response.json();
    
    // 3. Translate response to unified format
    return this.parseResponse(data, request);
  }

  private buildApiRequest(request: RoutingRequest): string {
    // Translate RoutingRequest to your API's format
    // Return query string or POST body
  }

  private parseResponse(data: any, request: RoutingRequest): Itinerary[] {
    // Translate API response to Itinerary[]
    return data.routes.map(route => this.parseItinerary(route, request));
  }

  private parseItinerary(route: any, request: RoutingRequest): Itinerary {
    // Parse individual itinerary
    return {
      duration: route.duration,
      startTime: new Date(route.start_time),
      endTime: new Date(route.end_time),
      legs: route.legs.map(leg => this.parseLeg(leg)),
      distance: route.distance,
      transfers: route.transfers || 0
    };
  }

  private parseLeg(leg: any): Leg {
    // Parse individual leg
    // ...
  }
}
```

### Step 2: Add Type Definitions (if needed)

Create types for your API-specific formats:

```typescript
// src/types/myRoutingAPI.ts
export interface MyRoutingAPIResponse {
  routes: MyAPIRoute[];
  status: string;
}

export interface MyAPIRoute {
  legs: MyAPILeg[];
  duration: number;
  distance: number;
}

// ... more types
```

### Step 3: Register the Adapter

Edit `src/configuration/config.ts`:

```typescript
import { MyRoutingAdapter } from '../adapters/routingEngines/MyRoutingAdapter';

const appConfiguration: AppConfiguration = {
  routingEngines: {
    // ... existing adapters
    "my-routing": new MyRoutingAdapter(
      process.env.REACT_APP_MY_ROUTING_API || 'https://my-api.example.com',
      { /* options */ }
    )
  }
};
```

### Step 4: Set as Default (optional)

```typescript
defaultRoutingEngine: "my-routing",
```

---

## Testing Adapters

### Unit Tests

Create `MyRoutingAdapter.test.ts`:

```typescript
import { MyRoutingAdapter } from './MyRoutingAdapter';
import { TransportationMode } from '../../types/mapTypes';

describe('MyRoutingAdapter', () => {
  let adapter: MyRoutingAdapter;

  beforeEach(() => {
    adapter = new MyRoutingAdapter('https://test-api.example.com');
  });

  it('should translate request correctly', () => {
    const request = {
      origin: { latitude: 5.57, longitude: -0.13 },
      destination: { latitude: 5.56, longitude: -0.21 },
      modes: [TransportationMode.CAR],
      wheelchair: false
    };

    // Test implementation
    const apiRequest = adapter['buildApiRequest'](request);
    expect(apiRequest).toContain('from=5.57,-0.13');
  });

  it('should parse response correctly', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse)
      })
    ) as jest.Mock;

    const itineraries = await adapter.getRoute(mockRequest);
    
    expect(itineraries).toHaveLength(1);
    expect(itineraries[0].duration).toBe(1200);
  });
});
```

### Integration Tests

Test against the real API:

```typescript
describe('MyRoutingAdapter Integration', () => {
  it('should get route from real API', async () => {
    const adapter = new MyRoutingAdapter(
      process.env.REACT_APP_MY_ROUTING_API
    );

    const itineraries = await adapter.getRoute({
      origin: { latitude: 5.57, longitude: -0.13 },
      destination: { latitude: 5.56, longitude: -0.21 },
      modes: [TransportationMode.CAR],
      wheelchair: false
    });

    expect(itineraries.length).toBeGreaterThan(0);
    expect(itineraries[0].legs).toBeDefined();
  }, 30000);  // 30 second timeout
});
```

---

## Adapter Best Practices

### 1. Error Handling

```typescript
async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
  try {
    const response = await fetch(this.buildUrl(request));
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }
    
    return this.parseResponse(data, request);
  } catch (error) {
    console.error('Routing error:', error);
    throw error;  // Or return empty array []
  }
}
```

### 2. Rate Limiting

```typescript
export class MyAdapter {
  private lastRequestTime: number = 0;
  private minInterval: number = 1000;  // 1 second

  async search(query: string): Promise<LocationResult[]> {
    // Wait if necessary
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minInterval) {
      await this.sleep(this.minInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
    
    // Make request
    // ...
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3. Retries

```typescript
async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await this.makeRequest(request);
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) {
        // Wait before retrying (exponential backoff)
        await this.sleep(1000 * Math.pow(2, attempt));
      }
    }
  }
  
  throw lastError;
}
```

### 4. Caching

Let TanStack Query handle caching at the service level, but you can add adapter-level caching for repeated identical requests within a short time:

```typescript
export class MyAdapter {
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private cacheDuration = 60000;  // 1 minute

  async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    
    const result = await this.makeRequest(request);
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  }

  private getCacheKey(request: RoutingRequest): string {
    return JSON.stringify(request);
  }
}
```

### 5. Timeouts

```typescript
async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);  // 30s timeout

  try {
    const response = await fetch(this.buildUrl(request), {
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    // ... parse response
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}
```

### 6. Logging

```typescript
async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
  const startTime = Date.now();
  
  try {
    const result = await this.makeRequest(request);
    const duration = Date.now() - startTime;
    
    console.log(`[${this.constructor.name}] Successfully got ${result.length} routes in ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${this.constructor.name}] Failed after ${duration}ms:`, error);
    throw error;
  }
}
```

---

## Next Steps

- **[Architecture Guide](./ARCHITECTURE.md)** - Understand the overall design
- **[Configuration Guide](./CONFIGURATION.md)** - Configure adapters
- **[Contributing Guide](./CONTRIBUTING.md)** - Submit your adapter

