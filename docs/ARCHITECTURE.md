# GoTrotro Architecture

This document provides a comprehensive overview of GoTrotro's architecture, design patterns, and data flow.

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Design Patterns](#design-patterns)
- [Layer Architecture](#layer-architecture)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Routing System](#routing-system)
- [Geocoding System](#geocoding-system)
- [Map Rendering](#map-rendering)
- [Type System](#type-system)

---

## High-Level Overview

GoTrotro is built as a **layered, plugin-based architecture** that separates concerns and makes the system highly extensible.

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (React Components, Pages, UI Logic)        │
├─────────────────────────────────────────────┤
│           Application Layer                 │
│  (Business Logic, Services, Hooks)          │
├─────────────────────────────────────────────┤
│           Adapter Layer                     │
│  (Routing Adapters, Geocoder Adapters)     │
├─────────────────────────────────────────────┤
│           Integration Layer                 │
│  (External APIs: OTP, OSRM, Nominatim)     │
└─────────────────────────────────────────────┘
```

### Core Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Interface Segregation**: Adapters implement focused interfaces
4. **Single Responsibility**: Each module/component has one reason to change
5. **Open/Closed**: Open for extension, closed for modification

---

## Design Patterns

### 1. Adapter Pattern (Primary Pattern)

The Adapter pattern is the core architectural pattern, used to abstract external services.

#### Problem Solved
- Multiple routing engines (OTP, OSRM, Valhalla) have different APIs
- Multiple geocoders (Nominatim, Photon) have different response formats
- We want to switch between them without changing application code

#### Implementation

```typescript
// 1. Define the interface
export interface RoutingAdapter {
  getRoute(request: RoutingRequest): Promise<Itinerary[]>;
}

// 2. Implement adapters
export class OtpAdapter implements RoutingAdapter {
  async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
    // Translate request → OTP API format
    // Call OTP API
    // Translate OTP response → unified Itinerary[] format
  }
}

export class OSRMAdapter implements RoutingAdapter {
  async getRoute(request: RoutingRequest): Promise<Itinerary[]> {
    // Same interface, different implementation
  }
}

// 3. Configure which adapter to use
const config = {
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter(otpUrl),
    "osrm": new OSRMAdapter(osrmUrl)
  }
};

// 4. Use polymorphically
const engine = config.routingEngines[config.defaultRoutingEngine];
const routes = await engine.getRoute(request);
```

**Benefits**:
- Switch services with one line of configuration
- Add new services without modifying existing code
- Test with mock adapters
- Each adapter is independently maintained

---

### 2. Strategy Pattern

Used for selecting different routing or geocoding strategies at runtime.

```typescript
// Select strategy based on configuration
const geocoder = appConfiguration.geocoders[appConfiguration.defaultGeocoder];
const results = await geocoder.search(query);
```

---

### 3. Factory Pattern

Used in context providers to create service instances.

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  }
});
```

---

### 4. Observer Pattern

Used via React's Context API for state management.

```typescript
// LocationContext notifies all subscribers when location changes
export const LocationProvider: React.FC = ({ children }) => {
  const [origin, setOrigin] = useState<LocationResult | null>(null);
  // All components using useLocation() are notified of changes
};
```

---

### 5. Hook Pattern

Custom hooks encapsulate reusable logic.

```typescript
// useGeocoder hook encapsulates geocoding logic
export function useGeocoder(/*...*/) {
  useEffect(() => {
    // Setup geocoder instance
    // Handle events
    // Cleanup on unmount
  }, [dependencies]);
}
```

---

## Layer Architecture

### Presentation Layer

**Location**: `src/components/`, `src/pages/`

**Responsibility**: User interface and user interaction

**Key Components**:
- `MapComponent.tsx` - Main map visualization
- `RouteInstructions.tsx` - Step-by-step directions
- `GeocoderInput.tsx` - Location search input
- `Home.tsx` - Main application page

**Characteristics**:
- Pure React components
- Minimal business logic
- Delegates data fetching to hooks
- Receives data via props or context

---

### Application Layer

**Location**: `src/services/`, `src/hooks/`, `src/queries/`

**Responsibility**: Business logic, data transformation, state management

**Key Modules**:
- `GeocoderService.ts` - Geocoding business logic
- `useLocationSearch.ts` - Location search hook with caching
- `useDebounce.ts` - Debounce utility hook
- `otpTransformer.ts` - Transforms OTP responses to display format

**Characteristics**:
- No direct API calls (uses adapters)
- Implements business rules
- Handles data transformation
- Uses TanStack Query for caching

---

### Adapter Layer

**Location**: `src/adapters/`

**Responsibility**: Translate between application interfaces and external APIs

**Routing Adapters**:
```
src/adapters/routingEngines/
├── OtpAdapter.ts       # OpenTripPlanner
├── OsrmAdapter.ts      # OSRM
└── VahallaAdapter.ts   # Valhalla
```

**Geocoding Adapters**:
```
src/adapters/geocoders/
├── NominatimAdapter.ts
└── PhotonAdapter.ts
```

**Characteristics**:
- Implements adapter interfaces
- Handles API-specific details
- Transforms request/response formats
- Error handling and retries

---

### Integration Layer

**Location**: External APIs (not in codebase)

**Services**:
- OpenTripPlanner (transit routing)
- OSRM (road routing)
- Valhalla (multi-modal routing)
- Nominatim (geocoding)
- Photon (geocoding)
- MapTiler (map tiles)

---

## Data Flow

### 1. Route Search Flow

```
User Input (Origin + Destination)
    ↓
GeocoderInput Component
    ↓
useGeocoder Hook
    ↓
GeocoderService
    ↓
GeocoderAdapter (Nominatim/Photon)
    ↓
External Geocoding API
    ↓
LocationResult[] (normalized)
    ↓
LocationContext (state)
    ↓
MapComponent
    ↓
RoutingService
    ↓
RoutingAdapter (OTP/OSRM/Valhalla)
    ↓
External Routing API
    ↓
Itinerary[] (normalized)
    ↓
Transform to DisplayItinerary
    ↓
RouteInstructions Component + Map Visualization
```

### 2. Data Transformation Pipeline

```
External API Response (API-specific format)
    ↓
Adapter.parseResponse() → Unified format
    ↓
Service.transform() → Business logic
    ↓
Component.render() → UI display
```

**Example**: OTP to DisplayItinerary

```typescript
// 1. OTP API returns complex JSON
const otpResponse = {
  plan: {
    itineraries: [{ legs: [...], duration: 3600, ... }]
  }
};

// 2. OtpAdapter normalizes to Itinerary[]
const itineraries: Itinerary[] = adapter.getRoute(request);

// 3. Transformer creates display format
const displayItinerary: DisplayItinerary = transformOTPItinerary(itineraries[0]);

// 4. Component renders
<RouteInstructions itinerary={displayItinerary} />
```

---

## State Management

GoTrotro uses a **hybrid state management** approach:

### 1. Local Component State

**When**: UI-only state that doesn't need sharing

**How**: `useState`, `useReducer`

```typescript
const [isCollapsed, setIsCollapsed] = useState(false);
```

### 2. Context API

**When**: State needs to be shared across components

**How**: React Context + Provider pattern

```typescript
// LocationContext shares origin/destination
const { origin, destination, setOrigin, setDestination } = useLocation();
```

### 3. TanStack Query (React Query)

**When**: Server state (API data) with caching needs

**How**: `useQuery`, `useMutation`

```typescript
// Automatically caches, deduplicates, and invalidates
const { data, isLoading, error } = useLocationSearch(query);
```

### 4. URL State

**When**: State should survive page refresh or be shareable

**How**: URL search params

```typescript
const [searchParams] = useSearchParams();
const origin = searchParams.get('origin');
```

### State Flow Diagram

```
┌──────────────────┐
│   URL Params     │ ← Shareable, bookmarkable state
└────────┬─────────┘
         ↓
┌──────────────────┐
│  Context State   │ ← Shared app state
└────────┬─────────┘
         ↓
┌──────────────────┐
│  TanStack Query  │ ← Server state + cache
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Component State  │ ← Local UI state
└──────────────────┘
```

---

## Routing System

### Architecture

```
┌─────────────────────────────────────┐
│      Routing Request                │
│  (origin, destination, modes, etc)  │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    Application Configuration        │
│  (selects which adapter to use)     │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      RoutingAdapter Interface       │
│   getRoute(): Promise<Itinerary[]>  │
└─────────────┬───────────────────────┘
              ↓
    ┌─────────┴─────────┬─────────────┐
    ↓                   ↓             ↓
┌─────────┐      ┌──────────┐   ┌──────────┐
│   OTP   │      │   OSRM   │   │ Valhalla │
│ Adapter │      │  Adapter │   │  Adapter │
└────┬────┘      └────┬─────┘   └────┬─────┘
     ↓                ↓              ↓
┌─────────┐      ┌──────────┐   ┌──────────┐
│   OTP   │      │   OSRM   │   │ Valhalla │
│   API   │      │    API   │   │    API   │
└─────────┘      └──────────┘   └──────────┘
```

### Request/Response Normalization

**Input**: Unified `RoutingRequest`
```typescript
{
  origin: { latitude, longitude },
  destination: { latitude, longitude },
  modes: [TransportationMode.TRANSIT, TransportationMode.WALK],
  wheelchair: boolean
}
```

**Output**: Unified `Itinerary[]`
```typescript
{
  duration: number,
  startTime: Date,
  endTime: Date,
  legs: Leg[],  // Walk, bus, train segments
  distance: number,
  transfers: number
}
```

Each adapter handles the translation to/from its specific API format.

---

## Geocoding System

### Architecture

Similar to routing but for location search:

```
Query String → GeocoderAdapter → LocationResult[]
```

### Caching Strategy

```typescript
// TanStack Query caches results for 5 minutes
useQuery({
  queryKey: ['locations', query],
  queryFn: () => searchLocations(query),
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 10 * 60 * 1000      // 10 minutes
});
```

**Benefits**:
- Reduces API calls
- Faster response for repeated searches
- Automatic background refetch when stale

---

## Map Rendering

### Component Hierarchy

```
MapComponent (Container)
    ├── Map (MapLibre wrapper)
    │   ├── NavigationControl
    │   ├── GeolocateControl
    │   ├── Marker (origin)
    │   ├── Marker (destination)
    │   └── Source + Layer (route)
    └── Loading Indicator
```

### Route Visualization Pipeline

```
Itinerary → extractGeometry() → GeoJSON → MapLibre Layer → Rendered Line
```

**Steps**:
1. Extract coordinates from itinerary legs
2. Decode polylines if encoded
3. Create GeoJSON LineString
4. Pass to MapLibre Source
5. Style with Layer paint properties

---

## Type System

### Type Safety Strategy

1. **Strict TypeScript Configuration**:
   ```json
   {
     "strict": true,
     "noImplicitAny": true,
     "strictNullChecks": true
   }
   ```

2. **Comprehensive Type Definitions**:
   - `mapTypes.ts` - Core domain types
   - `routeDisplay.ts` - Display/UI types
   - `homeLayoutTypes.ts` - Layout types

3. **Type Guards**:
   ```typescript
   if (Array.isArray(coord) && coord.length >= 2) {
     // TypeScript knows coord is [number, number]
   }
   ```

4. **Generic Constraints**:
   ```typescript
   export const useDebounce = <T>(value: T, delay: number) => {
     // Works with any type T
   };
   ```

---

## Extension Points

### Adding a New Routing Engine

1. Implement `RoutingAdapter` interface
2. Add to `src/adapters/routingEngines/`
3. Register in `src/configuration/config.ts`
4. Done! No other code changes needed

### Adding a New Geocoder

1. Implement `GeocoderAdapter` interface
2. Add to `src/adapters/geocoders/`
3. Register in configuration
4. Done!

### Adding a New Component

1. Create in `src/components/`
2. Import and use in parent
3. Add props interface for type safety

---

## Performance Considerations

### 1. Code Splitting
- Route-based splitting with React.lazy()
- Component lazy loading for heavy components

### 2. Memoization
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- React.memo for pure components

### 3. Query Optimization
- Debounced search input (500ms)
- Stale-while-revalidate caching
- Request deduplication

### 4. Map Optimization
- Vector tiles (efficient at any zoom level)
- Lazy polyline decoding
- Viewport-based rendering

---

## Security Considerations

1. **API Keys**: Stored in `.env`, never committed
2. **Input Validation**: All user inputs validated
3. **XSS Protection**: React escapes by default
4. **HTTPS**: All API calls over HTTPS
5. **Rate Limiting**: Implemented in adapters

---

## Testing Strategy

1. **Unit Tests**: Adapters, utilities, hooks
2. **Integration Tests**: Component + service interactions
3. **E2E Tests**: Full user workflows
4. **Type Checking**: TypeScript catches errors at compile time

---

## Further Reading

- [API Adapters Guide](./API_ADAPTERS.md)
- [Component Documentation](./COMPONENTS.md)
- [Configuration Guide](./CONFIGURATION.md)

