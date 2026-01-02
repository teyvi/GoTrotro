# Configuration Guide

This guide covers all configuration options for GoTrotro, from basic settings to advanced customizations.

## Table of Contents

- [Configuration Files](#configuration-files)
- [Environment Variables](#environment-variables)
- [Application Configuration](#application-configuration)
- [Routing Configuration](#routing-configuration)
- [Geocoding Configuration](#geocoding-configuration)
- [Map Configuration](#map-configuration)
- [Performance Tuning](#performance-tuning)
- [Production Configuration](#production-configuration)

---

## Configuration Files

GoTrotro uses several configuration files:

```
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment template (committed)
├── src/configuration/
│   ├── config.ts                 # Main app configuration
│   ├── template.ts               # Configuration type definitions
│   └── config.example.ts         # Example configuration
├── package.json                  # npm scripts and dependencies
└── tsconfig.json                 # TypeScript compiler options
```

---

## Environment Variables

### Overview

Environment variables are stored in `.env` and loaded at build time. They must be prefixed with `REACT_APP_` to be accessible in the React app.

### Required Variables

```env
# Map Tiles API Key (REQUIRED)
REACT_APP_MAPTILER_TOKEN=your_key_here
```

### Optional Variables

```env
#──────────────────────────────────────────────────
# Routing Services
#──────────────────────────────────────────────────

# OpenTripPlanner
REACT_APP_OTP_API=http://localhost:8080/otp/routers/default/plan

# OSRM
REACT_APP_OSRM_API=https://router.project-osrm.org

# Valhalla
REACT_APP_VALHALLA_API=https://valhalla1.openstreetmap.de

#──────────────────────────────────────────────────
# Geocoding Services
#──────────────────────────────────────────────────

# Nominatim
REACT_APP_NOMINATIM_API=https://nominatim.openstreetmap.org
REACT_APP_NOMINATIM_EMAIL=your-email@example.com

# Photon
REACT_APP_PHOTON_API=https://photon.komoot.io

#──────────────────────────────────────────────────
# Application Settings
#──────────────────────────────────────────────────

# Default country for geocoding
REACT_APP_DEFAULT_COUNTRY=gh

# Default center for map
REACT_APP_MAP_CENTER_LAT=5.55619
REACT_APP_MAP_CENTER_LNG=-0.20119
REACT_APP_MAP_DEFAULT_ZOOM=11

# API Timeouts (milliseconds)
REACT_APP_ROUTING_TIMEOUT=30000
REACT_APP_GEOCODING_TIMEOUT=10000
```

### Environment-Specific Files

Create separate files for different environments:

```bash
.env.development    # Development (npm start)
.env.production     # Production (npm run build)
.env.test           # Testing (npm test)
```

React automatically loads the correct file based on `NODE_ENV`.

---

## Application Configuration

### Configuration File Location

`src/configuration/config.ts`

### Configuration Structure

```typescript
import { AppConfiguration } from "./template";
import { OtpAdapter } from "../adapters/routingEngines/OtpAdapter";
import { NominatimAdapter } from "../adapters/geocoders/NominatimAdapter";

const appConfiguration: AppConfiguration = {
  // Application name
  appName: "GoTrotro",
  
  // Routing configuration
  defaultRoutingEngine: "otp",
  routingEngines: {
    // ... routing adapters
  },
  
  // Geocoding configuration
  defaultGeocoder: "nominatim",
  geocoders: {
    // ... geocoding adapters
  },
  
  // Map styling
  defaultMapStyle: "streets",
  mapStyles: {
    // ... map style URLs
  }
};

export { appConfiguration };
```

---

## Routing Configuration

### Adding a Routing Engine

```typescript
import { OSRMAdapter } from "../adapters/routingEngines/OsrmAdapter";

const appConfiguration: AppConfiguration = {
  defaultRoutingEngine: "osrm",  // Set as default
  
  routingEngines: {
    "otp": new OtpAdapter(
      process.env.REACT_APP_OTP_API || 'http://localhost:8080/otp/routers/default/plan'
    ),
    
    "osrm": new OSRMAdapter(
      process.env.REACT_APP_OSRM_API || 'https://router.project-osrm.org',
      {
        profile: 'driving',  // 'driving', 'walking', or 'cycling'
        steps: true,         // Include turn-by-turn instructions
        alternatives: 3,     // Number of alternative routes
        annotations: true    // Include detailed annotations
      }
    ),
    
    "valhalla": new ValhallaAdapter(
      process.env.REACT_APP_VALHALLA_API || 'https://valhalla1.openstreetmap.de',
      {
        costing: 'auto',     // 'auto', 'bicycle', 'pedestrian', 'multimodal'
        units: 'kilometers'  // 'kilometers' or 'miles'
      }
    )
  }
};
```

### OTP-Specific Configuration

```typescript
new OtpAdapter(
  'http://localhost:8080/otp/routers/default/plan',
  {
    // Maximum walk distance (meters)
    maxWalkDistance: 3500,
    
    // Preferred modes
    modes: ['TRANSIT', 'WALK'],
    
    // Wheelchair accessibility
    wheelchair: false,
    
    // Optimization strategy
    optimize: 'QUICK',  // 'QUICK', 'SAFE', 'FLAT', 'GREENWAYS', 'TRIANGLE'
    
    // Time preferences
    arriveBy: false,    // false = departure time, true = arrival time
    
    // Number of itineraries to return
    numItineraries: 3
  }
)
```

### OSRM Configuration

```typescript
new OSRMAdapter(
  'https://router.project-osrm.org',
  {
    profile: 'driving',        // Routing profile
    steps: true,               // Turn-by-turn instructions
    alternatives: 3,           // Alternative routes
    geometries: 'polyline',    // 'polyline', 'polyline6', or 'geojson'
    overview: 'full',          // 'full', 'simplified', or 'false'
    annotations: true,         // Speed, duration, distance annotations
    continue_straight: true,   // Force continuing straight at waypoints
    bearings: undefined,       // Bearing constraints
    radiuses: undefined        // Coordinate precision radiuses
  }
)
```

### Valhalla Configuration

```typescript
new ValhallaAdapter(
  'https://valhalla1.openstreetmap.de',
  {
    costing: 'auto',           // Routing mode
    units: 'kilometers',       // Distance units
    language: 'en',            // Narrative language
    directions_type: 'instructions',  // 'instructions' or 'maneuvers'
    
    // Mode-specific options
    costing_options: {
      auto: {
        maneuver_penalty: 5,
        gate_penalty: 300,
        toll_booth_penalty: 0,
        use_highways: 1.0,
        use_tolls: 1.0
      },
      pedestrian: {
        walking_speed: 5.1,    // km/h
        step_penalty: 0
      }
    }
  }
)
```

### Switching Routing Engines at Runtime

```typescript
// In your service or component
import { appConfiguration } from './configuration/config';

// Get configured engine
const engine = appConfiguration.routingEngines[appConfiguration.defaultRoutingEngine];

// Or use a specific engine
const otpEngine = appConfiguration.routingEngines['otp'];
const routes = await otpEngine.getRoute(request);

// Switch default engine
appConfiguration.defaultRoutingEngine = 'osrm';
```

---

## Geocoding Configuration

### Adding a Geocoder

```typescript
import { NominatimAdapter } from "../adapters/geocoders/NominatimAdapter";
import { PhotonAdapter } from "../adapters/geocoders/PhotonAdapter";

const appConfiguration: AppConfiguration = {
  defaultGeocoder: "nominatim",
  
  geocoders: {
    "nominatim": new NominatimAdapter(
      process.env.REACT_APP_NOMINATIM_API || 'https://nominatim.openstreetmap.org',
      {
        userAgent: 'GoTrotro/1.0',  // Required by Nominatim
        email: process.env.REACT_APP_NOMINATIM_EMAIL || 'contact@example.com',
        minRequestInterval: 1500,    // Milliseconds between requests
        defaultLanguage: 'en',
        defaultCountry: 'gh',        // Ghana
        viewbox: '-3.25,4.5,1.25,11.25',  // Bounding box for Ghana
        bounded: true                 // Restrict to viewbox
      }
    ),
    
    "photon": new PhotonAdapter(
      process.env.REACT_APP_PHOTON_API || 'https://photon.komoot.io',
      {
        minRequestInterval: 100,     // Photon is less strict
        language: 'en',
        limit: 15,
        bbox: '-3.25,4.5,1.25,11.25',  // Ghana bounding box
        layer: undefined             // Filter by layer (address, street, etc.)
      }
    )
  }
};
```

### Nominatim Configuration

```typescript
new NominatimAdapter(url, {
  // REQUIRED
  userAgent: 'YourAppName/1.0',  // Identify your application
  email: 'your@email.com',       // Contact email
  
  // Rate limiting
  minRequestInterval: 1500,      // Min ms between requests (Nominatim policy)
  
  // Search options
  defaultLanguage: 'en',         // Response language
  defaultCountry: 'gh',          // Country bias
  limit: 15,                     // Max results per search
  
  // Geographic bounds
  viewbox: 'lon1,lat1,lon2,lat2',  // Bounding box
  bounded: true,                 // Restrict to viewbox
  
  // Result types
  addressdetails: true,          // Include detailed address components
  extratags: false,              // Include OSM tags
  namedetails: false             // Include alternate names
})
```

### Photon Configuration

```typescript
new PhotonAdapter(url, {
  // Rate limiting
  minRequestInterval: 100,       // Photon is more permissive
  
  // Search parameters
  language: 'en',
  limit: 15,
  
  // Geographic filtering
  bbox: 'lon1,lat1,lon2,lat2',   // Bounding box
  lat: 5.55619,                  // Bias towards location
  lon: -0.20119,
  
  // Layer filtering
  layer: 'address',              // 'address', 'street', 'locality', etc.
  
  // Location type filtering
  osm_tag: ['place:city', 'place:town']  // Filter by OSM tags
})
```

---

## Map Configuration

### Map Styles

```typescript
const appConfiguration: AppConfiguration = {
  defaultMapStyle: "streets",
  
  mapStyles: {
    "streets": `https://api.maptiler.com/maps/streets/style.json?key=${process.env.REACT_APP_MAPTILER_TOKEN}`,
    
    "satellite": `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.REACT_APP_MAPTILER_TOKEN}`,
    
    "dark": `https://api.maptiler.com/maps/streets-dark/style.json?key=${process.env.REACT_APP_MAPTILER_TOKEN}`,
    
    "osm-bright": `https://api.maptiler.com/maps/bright/style.json?key=${process.env.REACT_APP_MAPTILER_TOKEN}`,
    
    // Custom style
    "custom": "https://your-custom-style-url.json"
  }
};
```

### Map Initial View

Edit `src/components/MapComponent.tsx`:

```typescript
<Map
  initialViewState={{
    longitude: parseFloat(process.env.REACT_APP_MAP_CENTER_LNG || '-0.20119'),
    latitude: parseFloat(process.env.REACT_APP_MAP_CENTER_LAT || '5.55619'),
    zoom: parseInt(process.env.REACT_APP_MAP_DEFAULT_ZOOM || '11'),
  }}
  // ... other props
/>
```

### Route Visualization Style

```typescript
// In MapComponent.tsx, modify Layer paint properties
<Layer 
  id="route"
  type="line"
  paint={{
    "line-color": "#FF0000",      // Route color
    "line-width": 6,              // Line thickness
    "line-opacity": 0.8,          // Transparency
    "line-dasharray": [2, 1]      // Dashed line (optional)
  }}
/>
```

---

## Performance Tuning

### TanStack Query Configuration

Edit `src/App.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Data considered fresh for 5 min
      gcTime: 10 * 60 * 1000,          // Cache persists for 10 min
      retry: 2,                         // Retry failed requests 2 times
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),  // Exponential backoff
      refetchOnWindowFocus: false,     // Don't refetch when window gains focus
      refetchOnReconnect: true,        // Refetch when network reconnects
    },
    mutations: {
      retry: 1                          // Retry mutations once
    }
  }
});
```

### Debounce Configuration

Edit `src/hooks/useDebounce.ts`:

```typescript
// Change default delay (currently 500ms)
export const useDebounce = <T>(value: T, delay: number = 300) => {
  // Lower value = faster response, more API calls
  // Higher value = slower response, fewer API calls
  // ...
};
```

### Map Performance

```typescript
<Map
  // Reduce animation duration for faster transitions
  transitionDuration={1000}  // Default: 2000
  
  // Limit max zoom for performance
  maxZoom={18}
  minZoom={8}
  
  // Optimize rendering
  preserveDrawingBuffer={false}
  antialias={true}
/>
```

---

## Production Configuration

### Build Optimization

Edit `package.json`:

```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && source-map-explorer 'build/static/js/*.js'"
  }
}
```

### Environment Variables for Production

Create `.env.production`:

```env
# Use production API endpoints
REACT_APP_OTP_API=https://your-production-otp.example.com/otp/routers/default/plan
REACT_APP_OSRM_API=https://your-production-osrm.example.com
REACT_APP_NOMINATIM_API=https://your-production-nominatim.example.com

# MapTiler (use production key)
REACT_APP_MAPTILER_TOKEN=your_production_key

# Disable development features
REACT_APP_ENABLE_DEVTOOLS=false
```

### CSP Headers

Add to your web server configuration:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' 
    https://api.maptiler.com 
    https://nominatim.openstreetmap.org 
    http://localhost:8080;
  font-src 'self' data:;
```

---

## Configuration Best Practices

1. **Never commit `.env`**: Always use `.env.example` as a template
2. **Use environment-specific files**: `.env.development`, `.env.production`
3. **Validate configuration**: Add runtime checks for required variables
4. **Document changes**: Update `.env.example` when adding new variables
5. **Use sensible defaults**: Fallback to safe defaults when env vars are missing
6. **Rotate API keys**: Regularly rotate production API keys
7. **Monitor usage**: Track API usage to avoid rate limits

---

## Troubleshooting Configuration

### Environment Variables Not Loading

**Problem**: Changes to `.env` not reflected in app

**Solution**:
- Restart dev server (environment variables are loaded at startup)
- Ensure variable names start with `REACT_APP_`
- Check for typos in variable names

### Routing Engine Not Working

**Problem**: Routes not found or errors

**Solution**:
```typescript
// Add error handling
try {
  const routes = await engine.getRoute(request);
} catch (error) {
  console.error('Routing error:', error);
  // Check:
  // 1. Is the routing service URL correct?
  // 2. Is the service running?
  // 3. Are there network issues?
}
```

### Rate Limiting Issues

**Problem**: "Too many requests" errors

**Solution**:
- Increase `minRequestInterval` in adapter configuration
- Implement request queue
- Use caching more aggressively
- Consider self-hosting services

---

## Next Steps

- **[API Adapters Guide](./API_ADAPTERS.md)** - Learn about adapters in detail
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to production
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

