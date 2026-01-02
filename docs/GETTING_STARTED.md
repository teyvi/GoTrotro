# Getting Started with GoTrotro

This guide will help you get GoTrotro up and running on your local machine in under 10 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

### Verify Installation

```bash
node --version  # Should be v16+
npm --version   # Should be 8+
git --version   # Any recent version
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/gotrotro.git
cd gotrotro
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (~500MB, takes 2-3 minutes).

---

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# MapTiler API Key (required)
REACT_APP_MAPTILER_TOKEN=your_maptiler_api_key_here

# OpenTripPlanner API (optional - uses localhost by default)
REACT_APP_OTP_API=http://localhost:8080/otp/routers/default/plan

# OSRM API (optional - uses public server by default)
REACT_APP_OSRM_API=https://router.project-osrm.org

# Valhalla API (optional - uses public server by default)
REACT_APP_VALHALLA_API=https://valhalla1.openstreetmap.de

# Nominatim API (optional - uses public server by default)
REACT_APP_NOMINATIM_API=https://nominatim.openstreetmap.org
REACT_APP_NOMINATIM_EMAIL=your-email@example.com

# Photon API (optional - uses public server by default)
REACT_APP_PHOTON_API=https://photon.komoot.io
```

### Getting a MapTiler API Key (Free)

1. Go to [maptiler.com](https://www.maptiler.com/)
2. Sign up for a free account
3. Go to "Account" → "Keys"
4. Copy your API key
5. Paste it into `.env` as `REACT_APP_MAPTILER_TOKEN`

**Note**: The free tier includes 100,000 map loads per month, which is plenty for development.

---

## Step 4: Start the Development Server

```bash
npm start
```

The application will:
- Compile TypeScript
- Start the development server
- Open your browser at `http://localhost:3000`

You should see the GoTrotro home page with a map of Accra, Ghana.

---

## Step 5: Try Your First Route

1. Click on the **Origin** input field
2. Search for "Madina" and select a result
3. Click on the **Destination** input field
4. Search for "Circle" and select a result
5. Click **"Find Route"**

The app will:
- Calculate the best transit route
- Display it on the map
- Show step-by-step instructions

**Note**: If you're using the default OTP server (localhost), you'll need to have an OTP instance running with Ghana transit data. For testing, the app will fall back to showing straight lines.

---

## Understanding the Interface

### Main Components

```
┌─────────────────────────────────────────┐
│         GoTrotro Header                 │
├─────────────────────────────────────────┤
│  [Origin Input]    [↔]  [Dest Input]   │
│            [Find Route Button]          │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│            Interactive Map              │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│       Route Instructions Panel          │
│   (Appears after finding a route)       │
└─────────────────────────────────────────┘
```

### Key Features to Explore

1. **Location Search**: Type any place in Ghana to search
2. **Swap Locations**: Click the swap button (↔) to reverse origin/destination
3. **Map Controls**: 
   - Zoom in/out with `+`/`-` buttons
   - Locate yourself with the location button
   - Rotate/tilt with right-click + drag
4. **Route Instructions**: Scroll through step-by-step directions

---

## Common First-Time Issues

### 1. "Invalid MapTiler Token" Error

**Problem**: The map doesn't load and shows an error.

**Solution**: 
- Check that you've added your MapTiler API key to `.env`
- Make sure the variable name is exactly `REACT_APP_MAPTILER_TOKEN`
- Restart the dev server (`Ctrl+C`, then `npm start` again)

### 2. "Cannot Find Route" Error

**Problem**: Route search fails or shows straight lines.

**Solution**: 
- The default OTP server is `localhost:8080`, which may not be running
- For testing, you can use the public OSRM server by changing the default routing engine:

Edit `src/configuration/config.ts`:
```typescript
defaultRoutingEngine: "osrm",  // Change from "otp" to "osrm"
```

**Note**: OSRM provides road routing but doesn't include public transit information.

### 3. Port 3000 Already in Use

**Problem**: `npm start` fails because port 3000 is already in use.

**Solution**:
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or start on a different port
PORT=3001 npm start
```

---

## Next Steps

Now that you have the app running, you can:

1. **Explore the Code**: Start with `src/App.tsx` and work your way through
2. **Read the Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the design
3. **Configure Services**: Learn about routing adapters in [API_ADAPTERS.md](./API_ADAPTERS.md)
4. **Build Components**: Check out [COMPONENTS.md](./COMPONENTS.md) for component details
5. **Set Up OTP**: Follow [SETUP.md](./SETUP.md#setting-up-opentripplanner) for local transit routing

---

## Development Workflow

### Making Changes

1. Edit files in `src/`
2. Changes are hot-reloaded automatically
3. Check the browser console for errors
4. TypeScript errors appear in your terminal

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

---

## Getting Help

- **Documentation**: See the [docs/](../docs/) folder
- **Issues**: Check [existing issues](https://github.com/yourusername/gotrotro/issues)
- **Questions**: Ask in [Discussions](https://github.com/yourusername/gotrotro/discussions)

---

## What's Next?

- **[Architecture Overview](./ARCHITECTURE.md)** - Understand how the app works
- **[Setup Guide](./SETUP.md)** - Deep dive into setup and configuration
- **[Contributing Guide](./CONTRIBUTING.md)** - Learn how to contribute

Happy coding! 🚀

