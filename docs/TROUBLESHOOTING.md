# Troubleshooting Guide

This guide covers common issues you might encounter when developing or running GoTrotro, and how to resolve them.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Environment & Configuration](#environment--configuration)
- [Routing Issues](#routing-issues)
- [Map Issues](#map-issues)
- [Geocoding Issues](#geocoding-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### `npm install` Fails

**Problem**: Errors during dependency installation

**Common errors**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions**:

1. **Clear cache and reinstall**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Use legacy peer deps** (if peer dependency conflicts):
```bash
npm install --legacy-peer-deps
```

3. **Check Node version**:
```bash
node --version  # Should be v16+ 
```

4. **Update npm**:
```bash
npm install -g npm@latest
```

---

### TypeScript Errors After Install

**Problem**: TypeScript complains about missing types

**Solution**:
```bash
# Install type definitions
npm install --save-dev @types/react @types/react-dom @types/node

# Restart your IDE
```

---

## Environment & Configuration

### Environment Variables Not Loading

**Problem**: Changes to `.env` not reflected in app

**Causes & Solutions**:

1. **Server not restarted**:
   - Environment variables are loaded at startup
   - Solution: Restart dev server (`Ctrl+C`, then `npm start`)

2. **Incorrect variable names**:
   - Must start with `REACT_APP_`
   - Solution: Rename `MY_API_KEY` to `REACT_APP_MY_API_KEY`

3. **Typo in variable name**:
   - Check spelling carefully
   - Solution: Use exact name from code

4. **File not named `.env`**:
   - Must be exactly `.env` (with dot)
   - Solution: Rename `env.txt` to `.env`

**Debug command**:
```bash
# Print all REACT_APP_ variables
node -e "console.log(process.env)" | grep REACT_APP
```

---

### Invalid MapTiler Token

**Problem**: Map doesn't load, console shows "Invalid API key"

**Solutions**:

1. **Verify token in `.env`**:
```env
REACT_APP_MAPTILER_TOKEN=your_actual_token_here
```

2. **Check token validity**:
   - Go to [maptiler.com](https://www.maptiler.com/cloud/)
   - Verify token is active
   - Check usage limits

3. **Restart server** after adding token

4. **Check for extra spaces**:
```env
# Bad:
REACT_APP_MAPTILER_TOKEN= token_with_spaces 

# Good:
REACT_APP_MAPTILER_TOKEN=token_without_spaces
```

---

## Routing Issues

### "No Route Found" Error

**Problem**: Route search returns no results

**Possible Causes**:

#### 1. OTP Server Not Running

**Check**:
```bash
curl http://localhost:8080/otp/
```

**Solution**:
```bash
cd ~/otp
java -Xmx4G -jar otp-2.3.0.jar --load ghana/ --serve
```

#### 2. Wrong OTP URL

**Check `.env`**:
```env
REACT_APP_OTP_API=http://localhost:8080/otp/routers/default/plan
```

**Common mistakes**:
- Missing `/otp/routers/default/plan`
- Using `https` instead of `http` for localhost
- Wrong port number

#### 3. No Data for Region

**Problem**: OTP has no GTFS data for your search area

**Solution**:
- Check OTP logs for "No trips found"
- Verify GTFS data covers your region
- Try a well-known route first (e.g., major transit stops)

#### 4. Coordinates Outside Coverage Area

**Check coordinates**:
```javascript
console.log('Origin:', origin.coordinates);
console.log('Destination:', destination.coordinates);
```

**Solution**: Ensure coordinates are within Ghana:
- Latitude: 4.5° to 11.25° N
- Longitude: -3.25° to 1.25° E

---

### CORS Errors with Routing API

**Problem**: Browser console shows CORS policy error

**Error message**:
```
Access to fetch at 'http://localhost:8080/otp/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions**:

1. **Configure OTP CORS** (if self-hosting):
   Add to `router-config.json`:
   ```json
   {
     "routingDefaults": { ... },
     "updaters": [],
     "cors": {
       "allowedOrigins": ["http://localhost:3000"]
     }
   }
   ```

2. **Use proxy** in `package.json`:
   ```json
   {
     "proxy": "http://localhost:8080"
   }
   ```
   Then change API URL in code:
   ```typescript
   // Before:
   const url = 'http://localhost:8080/otp/routers/default/plan';
   
   // After:
   const url = '/otp/routers/default/plan';
   ```

---

### Walk Routes Appear as Straight Lines

**Problem**: Walking segments don't follow streets

**This is a known issue** - see our [WALK_GEOMETRY_ISSUE.md](../WALK_GEOMETRY_ISSUE.md) documentation.

**Root Cause**: OTP server returns simplified geometry (only 2 points) for walk legs.

**Solutions**:

1. **Check OTP configuration**: Ensure pedestrian routing is enabled in `build-config.json`

2. **Use OSRM for walk segments**: Configure hybrid routing (OTP for transit, OSRM for walking)

3. **Rebuild OTP graph** with better pedestrian settings

4. **Accept limitation**: For now, walk segments show approximate paths

---

## Map Issues

### Map Not Rendering

**Problem**: Blank screen where map should be

**Common Causes**:

#### 1. Missing MapTiler Token
See [Invalid MapTiler Token](#invalid-maptiler-token) above

#### 2. Container Height Not Set

**Check CSS**:
```css
.map-container {
  width: 100%;
  height: 500px;  /* Must have explicit height */
}
```

#### 3. MapLibre GL JS Not Loaded

**Check imports**:
```typescript
import 'maplibre-gl/dist/maplibre-gl.css';
```

**Check network tab** for failed CSS/JS loads

---

### Route Line Not Showing

**Problem**: Markers appear but no route line

**Debug**:
```typescript
// Add logging in MapComponent.tsx
console.log('Route data:', routeData);
console.log('Coordinates:', routeData?.geometry.coordinates);
```

**Common Causes**:

1. **Empty coordinates**:
   - Check if `coordinates.length > 0`
   - Verify polyline decoding worked

2. **Layer ordering issue**:
   - Route layer might be behind other layers
   - Check layer `id` and `beforeId` props

3. **Style not applied**:
   ```typescript
   <Layer 
     id="route"
     type="line"
     paint={{
       "line-color": "#FF0000",  // Check color is visible
       "line-width": 6,           // Check width is sufficient
       "line-opacity": 1.0        // Check not transparent
     }}
   />
   ```

---

### Map Performance Issues

**Problem**: Map is slow or laggy

**Solutions**:

1. **Reduce route complexity**:
```typescript
// Simplify coordinates if too many
if (coordinates.length > 1000) {
  coordinates = simplifyCoordinates(coordinates, tolerance);
}
```

2. **Optimize layer rendering**:
```typescript
<Layer
  id="route"
  type="line"
  paint={{
    "line-width": [
      "interpolate",
      ["exponential", 1.5],
      ["zoom"],
      10, 2,
      18, 6
    ]
  }}
/>
```

3. **Use vector tiles** (already default in MapLibre)

4. **Limit viewport** to necessary area

---

## Geocoding Issues

### "Too Many Requests" Error

**Problem**: Nominatim returns 429 status

**Cause**: Rate limit exceeded (1 request/second for public server)

**Solutions**:

1. **Increase debounce delay**:
```typescript
// In useDebounce.ts
export const useDebounce = <T>(value: T, delay: number = 1000) => {
  // Increase from 500ms to 1000ms
}
```

2. **Increase rate limit in adapter**:
```typescript
new NominatimAdapter(url, {
  minRequestInterval: 2000  // 2 seconds between requests
})
```

3. **Self-host Nominatim** for higher limits

4. **Switch to Photon** (more permissive):
```typescript
// In config.ts
defaultGeocoder: "photon",
```

---

### No Search Results

**Problem**: Geocoding returns empty array

**Causes & Solutions**:

1. **Too specific query**:
   - Try broader terms: "Madina" instead of "123 Madina Street"

2. **Spelling errors**:
   - Check query spelling

3. **Outside coverage area**:
   - Ensure searching within Ghana

4. **Country filter too strict**:
```typescript
// Try without country filter
const results = await geocoder.search('Accra', {
  limit: 10
  // Remove countryCode filter temporarily
});
```

**Debug**:
```typescript
console.log('Geocoding query:', query);
console.log('Geocoding options:', options);
console.log('Geocoding results:', results);
```

---

## Build & Deployment Issues

### Build Fails

**Problem**: `npm run build` fails with errors

**Common Causes**:

#### 1. TypeScript Errors

**Error**:
```
TypeScript error in src/components/MapComponent.tsx(123,45):
Property 'xyz' does not exist on type 'ABC'
```

**Solution**: Fix TypeScript errors before building

#### 2. Missing Environment Variables

**Solution**: Create `.env.production`:
```env
REACT_APP_MAPTILER_TOKEN=production_token
REACT_APP_OTP_API=https://production-api.example.com
```

#### 3. Out of Memory

**Error**:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

### Production Build Too Large

**Problem**: Build size > 2MB, slow load times

**Solutions**:

1. **Analyze bundle**:
```bash
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

2. **Enable code splitting**:
```typescript
// Use React.lazy for large components
const MapComponent = React.lazy(() => import('./components/MapComponent'));
```

3. **Remove unused dependencies**:
```bash
npm uninstall unused-package
```

4. **Optimize images**:
   - Use WebP format
   - Compress images
   - Use appropriate sizes

---

## Performance Issues

### Slow Route Calculation

**Problem**: Routes take > 5 seconds to calculate

**Solutions**:

1. **Check OTP server performance**:
```bash
# Monitor OTP logs
tail -f ~/otp/logs/otp.log
```

2. **Reduce alternatives**:
```typescript
new OtpAdapter(url, {
  numItineraries: 1  // Reduce from 3 to 1
})
```

3. **Add request timeout**:
```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 10000);  // 10s timeout

fetch(url, { signal: controller.signal });
```

4. **Use caching**:
   - TanStack Query already caches
   - Check `staleTime` configuration

---

### Memory Leaks

**Problem**: App memory usage grows over time

**Causes & Solutions**:

1. **Event listeners not cleaned up**:
```typescript
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  
  // IMPORTANT: Clean up!
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

2. **Map not disposed**:
```typescript
useEffect(() => {
  // Map cleanup
  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
    }
  };
}, []);
```

3. **Large state objects**:
   - Clear route data when not needed
   - Limit history size

---

## Getting More Help

If your issue isn't covered here:

1. **Check documentation**: [docs/README.md](./README.md)
2. **Search issues**: [GitHub Issues](https://github.com/yourusername/gotrotro/issues)
3. **Ask in discussions**: [GitHub Discussions](https://github.com/yourusername/gotrotro/discussions)
4. **Create new issue**: Provide full error messages and steps to reproduce

---

## Debug Mode

Enable verbose logging:

```typescript
// Add to src/index.tsx
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true;
}

// Use in code
if (window.DEBUG) {
  console.log('Debug info:', data);
}
```

---

## Useful Commands

```bash
# Clear all caches
npm cache clean --force
rm -rf node_modules package-lock.json .cache build
npm install

# Reset git state
git clean -fdx  # Warning: Removes all untracked files!
git reset --hard

# Check for port conflicts
lsof -i :3000
lsof -i :8080

# View real-time logs
tail -f ~/otp/logs/otp.log

# Monitor network requests
# Open browser DevTools → Network tab
```

