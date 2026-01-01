# Quick Start: Adapter Configuration

This guide shows you how to quickly configure GoTrotro with different routing engines and geocoding services.

## 🚀 Quick Setup

### Step 1: Choose Your Configuration

Pick one of these common setups:

#### Option A: OTP + Nominatim (Default, Transit-focused)
```typescript
// src/configuration/config.ts
import { OtpAdapter } from "../adapters/routingEngines/OtpAdapter";
import { NominatimAdapter } from "../adapters/geocoders/NominatimAdapter";

const appConfiguration: AppConfiguration = {
  appName: "MyTransitApp",
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter("http://localhost:8080/otp/routers/default/plan")
  },
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter("https://nominatim.openstreetmap.org", {
      userAgent: "MyTransitApp",
      email: "contact@example.com"
    })
  },
  defaultMapStyle: "",
  mapStyles: {}
};
```

#### Option B: OSRM + Photon (Fast car routing)
```typescript
// src/configuration/config.ts
import { OSRMAdapter } from "../adapters/routingEngines/OsrmAdapter";
import { PhotonAdapter } from "../adapters/geocoders/PhotonAdapter";

const appConfiguration: AppConfiguration = {
  appName: "MyRoutingApp",
  defaultRoutingEngine: "osrm",
  routingEngines: {
    "osrm": new OSRMAdapter("https://router.project-osrm.org", { profile: "driving" })
  },
  defaultGeocoder: "photon",
  geocoders: {
    "photon": new PhotonAdapter("https://photon.komoot.io")
  },
  defaultMapStyle: "",
  mapStyles: {}
};
```

#### Option C: All Adapters (Maximum flexibility)
```typescript
// src/configuration/config.ts
import { OtpAdapter } from "../adapters/routingEngines/OtpAdapter";
import { OSRMAdapter } from "../adapters/routingEngines/OsrmAdapter";
import { ValhallaAdapter } from "../adapters/routingEngines/VahallaAdapter";
import { NominatimAdapter } from "../adapters/geocoders/NominatimAdapter";
import { PhotonAdapter } from "../adapters/geocoders/PhotonAdapter";

const appConfiguration: AppConfiguration = {
  appName: "FlexibleApp",
  
  defaultRoutingEngine: "otp", // Change this to switch default
  routingEngines: {
    "otp": new OtpAdapter(process.env.REACT_APP_OTP_API || "http://localhost:8080/otp/routers/default/plan"),
    "osrm": new OSRMAdapter(process.env.REACT_APP_OSRM_API || "https://router.project-osrm.org", { profile: "driving" }),
    "valhalla": new ValhallaAdapter(process.env.REACT_APP_VALHALLA_API || "https://valhalla1.openstreetmap.de")
  },
  
  defaultGeocoder: "nominatim", // Change this to switch default
  geocoders: {
    "nominatim": new NominatimAdapter(process.env.REACT_APP_NOMINATIM_API || "https://nominatim.openstreetmap.org", {
      email: process.env.REACT_APP_NOMINATIM_EMAIL
    }),
    "photon": new PhotonAdapter(process.env.REACT_APP_PHOTON_API || "https://photon.komoot.io")
  },
  
  defaultMapStyle: "",
  mapStyles: {}
};
```

### Step 2: Set Environment Variables (Optional)

Create `.env` file:

```bash
# Routing
REACT_APP_OTP_API=http://localhost:8080/otp/routers/default/plan
REACT_APP_OSRM_API=https://router.project-osrm.org
REACT_APP_VALHALLA_API=https://valhalla1.openstreetmap.de

# Geocoding
REACT_APP_NOMINATIM_API=https://nominatim.openstreetmap.org
REACT_APP_NOMINATIM_EMAIL=your-email@example.com
REACT_APP_PHOTON_API=https://photon.komoot.io
```

### Step 3: Use in Your Code

The adapters are used automatically through the configuration:

```typescript
import { appConfiguration } from "./configuration/config";

// Get routes using configured routing engine
const routingEngine = appConfiguration.routingEngines[appConfiguration.defaultRoutingEngine];
const routes = await routingEngine.getRoute({
  origin: { latitude: 5.6037, longitude: -0.1870 },
  destination: { latitude: 5.6147, longitude: -0.2057 },
  modes: [TransportationMode.TRANSIT, TransportationMode.WALK],
  wheelchair: false
});

// Search locations using configured geocoder
const geocoder = appConfiguration.geocoders[appConfiguration.defaultGeocoder];
const results = await geocoder.search("Accra", {
  limit: 10,
  countryCode: "gh"
});
```

## 🔄 Switching Adapters

### At Configuration Level

Just change the `defaultRoutingEngine` or `defaultGeocoder`:

```typescript
const appConfiguration: AppConfiguration = {
  appName: "MyApp",
  defaultRoutingEngine: "osrm", // Changed from "otp"
  routingEngines: { /* ... */ },
  defaultGeocoder: "photon", // Changed from "nominatim"
  geocoders: { /* ... */ }
};
```

### At Runtime (Programmatically)

Use a specific adapter directly:

```typescript
// Use OSRM instead of default
const osrmEngine = appConfiguration.routingEngines["osrm"];
const routes = await osrmEngine.getRoute(options);

// Use Photon instead of default
const photonGeocoder = appConfiguration.geocoders["photon"];
const results = await photonGeocoder.search("Accra");
```

## 📋 Adapter Comparison

### Routing Engines

| Adapter | Use Case | Pros | Cons |
|---------|----------|------|------|
| **OTP** | Public transit | Multi-modal, real-time data | Requires server setup |
| **OSRM** | Car routing | Very fast, public instance | Limited to car routing |
| **Valhalla** | Multi-modal | Flexible, detailed | More complex setup |

### Geocoders

| Adapter | Use Case | Pros | Cons |
|---------|----------|------|------|
| **Nominatim** | General | Comprehensive, detailed | Rate limits (1/sec) |
| **Photon** | Fast searches | Higher limits, fast | Less detailed |

## 🛠️ Common Configurations

### For Development (Local Services)
```typescript
routingEngines: {
  "otp": new OtpAdapter("http://localhost:8080/otp/routers/default/plan")
}
```

### For Production (Public Services)
```typescript
routingEngines: {
  "osrm": new OSRMAdapter("https://router.project-osrm.org", { profile: "driving" })
},
geocoders: {
  "nominatim": new NominatimAdapter("https://nominatim.openstreetmap.org", {
    email: "your-production-email@example.com"
  })
}
```

### For Self-Hosted
```typescript
routingEngines: {
  "osrm": new OSRMAdapter("https://osrm.yourdomain.com")
},
geocoders: {
  "photon": new PhotonAdapter("https://photon.yourdomain.com")
}
```

## ⚙️ Adapter Options

### OTP Options
```typescript
new OtpAdapter("http://your-server/plan")
// No additional options at constructor level
// Options passed per request
```

### OSRM Options
```typescript
new OSRMAdapter("https://router.project-osrm.org", {
  profile: "driving" // or "bike-regular", "foot-walking"
})
```

### Valhalla Options
```typescript
new ValhallaAdapter("https://valhalla-server.com", {
  costing: "auto" // or "bicycle", "pedestrian", "truck", etc.
})
```

### Nominatim Options
```typescript
new NominatimAdapter("https://nominatim.openstreetmap.org", {
  userAgent: "YourApp/1.0",
  email: "contact@yourapp.com",
  minRequestInterval: 1500 // milliseconds between requests
})
```

### Photon Options
```typescript
new PhotonAdapter("https://photon.komoot.io", {
  minRequestInterval: 100 // milliseconds between requests
})
```

## 🔍 Need More Help?

- **Full Documentation**: See `ADAPTERS.md`
- **Examples**: See `src/configuration/config.example.ts`
- **Type Definitions**: See `src/types/mapTypes.ts`

## ✅ Checklist

- [ ] Choose your routing engine (OTP, OSRM, or Valhalla)
- [ ] Choose your geocoding service (Nominatim or Photon)
- [ ] Update `src/configuration/config.ts`
- [ ] Set environment variables (optional)
- [ ] Test routing and geocoding
- [ ] Deploy!

