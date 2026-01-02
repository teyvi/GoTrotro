# Setup & Installation Guide

This comprehensive guide covers everything you need to set up GoTrotro for development, from basic installation to advanced configurations including local OpenTripPlanner setup.

## Table of Contents

- [System Requirements](#system-requirements)
- [Basic Installation](#basic-installation)
- [Environment Configuration](#environment-configuration)
- [Setting Up OpenTripPlanner](#setting-up-opentripplanner)
- [Alternative Routing Engines](#alternative-routing-engines)
- [Database Setup (Optional)](#database-setup-optional)
- [IDE Configuration](#ide-configuration)
- [Troubleshooting Setup Issues](#troubleshooting-setup-issues)

---

## System Requirements

### Minimum Requirements
- **OS**: macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+)
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB free space (5GB+ if setting up local OTP)
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher

### Recommended Requirements
- **RAM**: 16GB (for running OTP + app simultaneously)
- **CPU**: 4+ cores
- **Disk**: 10GB+ SSD
- **Node.js**: v18 LTS

### Verify Your System

```bash
# Check Node.js version
node --version
# Output: v18.x.x or higher

# Check npm version
npm --version
# Output: 8.x.x or higher

# Check available RAM
# macOS/Linux:
free -h
# Windows:
systeminfo | findstr "Total Physical Memory"
```

---

## Basic Installation

### 1. Clone the Repository

```bash
# HTTPS
git clone https://github.com/yourusername/gotrotro.git

# Or SSH (if you have SSH keys set up)
git clone git@github.com:yourusername/gotrotro.git

# Navigate to project directory
cd gotrotro
```

### 2. Install Dependencies

```bash
# Using npm (recommended)
npm install

# Or using yarn
yarn install
```

**Note**: Installation may take 2-5 minutes depending on your internet speed.

### 3. Verify Installation

```bash
# Check that all packages installed correctly
npm list --depth=0

# You should see all dependencies listed without errors
```

---

## Environment Configuration

### Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### Configure Required Variables

Edit `.env` with your favorite text editor:

```bash
nano .env
# or
code .env  # VS Code
```

#### Minimum Configuration

```env
# ============================================
# REQUIRED: MapTiler API Key
# ============================================
REACT_APP_MAPTILER_TOKEN=get_your_key_at_maptiler.com

# ============================================
# OPTIONAL: Routing Services
# (Defaults work for testing)
# ============================================

# OpenTripPlanner (for transit routing)
REACT_APP_OTP_API=http://localhost:8080/otp/routers/default/plan

# OSRM (for road routing)
REACT_APP_OSRM_API=https://router.project-osrm.org

# Valhalla (for multi-modal routing)
REACT_APP_VALHALLA_API=https://valhalla1.openstreetmap.de

# ============================================
# OPTIONAL: Geocoding Services
# ============================================

# Nominatim (primary geocoder)
REACT_APP_NOMINATIM_API=https://nominatim.openstreetmap.org
REACT_APP_NOMINATIM_EMAIL=your-email@example.com

# Photon (alternative geocoder)
REACT_APP_PHOTON_API=https://photon.komoot.io
```

### Getting API Keys

#### MapTiler (Required)

1. Visit [maptiler.com](https://www.maptiler.com/)
2. Click "Sign Up" (it's free)
3. Verify your email
4. Go to "Account" → "Keys"
5. Copy the API key
6. Paste into `.env` as `REACT_APP_MAPTILER_TOKEN`

**Free Tier Limits**: 100,000 map loads/month (more than enough for development)

#### Nominatim Email (Recommended)

Nominatim requires an email address for usage tracking. Use a valid email:

```env
REACT_APP_NOMINATIM_EMAIL=your-actual-email@example.com
```

---

## Setting Up OpenTripPlanner

OpenTripPlanner (OTP) provides transit routing with real-time schedules. Setting it up locally gives you full control and better performance.

### Prerequisites

- **Java 11 or higher** (OTP 2.x requires Java 11+)
- **8GB+ RAM** recommended
- **5GB+ disk space** for Ghana GTFS and OSM data

### Step 1: Install Java

```bash
# Check if Java is installed
java -version

# If not installed:

# macOS (using Homebrew)
brew install openjdk@11

# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk

# Windows
# Download from https://adoptium.net/
```

### Step 2: Download OpenTripPlanner

```bash
# Create OTP directory
mkdir -p ~/otp
cd ~/otp

# Download OTP 2.3 (latest stable as of Jan 2026)
wget https://repo1.maven.org/maven2/org/opentripplanner/otp/2.3.0/otp-2.3.0-shaded.jar

# Or use curl
curl -L https://repo1.maven.org/maven2/org/opentripplanner/otp/2.3.0/otp-2.3.0-shaded.jar -o otp-2.3.0.jar
```

### Step 3: Download Ghana Data

```bash
# Create data directory
mkdir -p ~/otp/ghana

# Download Ghana OSM data (OpenStreetMap)
wget https://download.geofabrik.de/africa/ghana-latest.osm.pbf -P ~/otp/ghana

# Download Ghana GTFS data
# Note: You'll need to source this from Ghana's transit agencies
# For testing, you can create a minimal GTFS or use sample data
```

**GTFS Data Sources for Ghana**:
- Contact AMA (Accra Metropolitan Assembly) Department of Transport
- Check [transitfeeds.com](https://transitfeeds.com/)
- Community-sourced data from [OpenTransportData](https://opentransportdata.org/)

### Step 4: Build the Graph

```bash
cd ~/otp

# Build the routing graph (takes 5-15 minutes)
java -Xmx4G -jar otp-2.3.0.jar --build --save ghana/
```

**What happens during build**:
- OTP processes the OSM file (streets, sidewalks)
- OTP processes GTFS files (transit routes, schedules)
- Creates a routing graph (`graph.obj`)
- Validates data and reports any issues

**Expected output**:
```
INFO Graph saved.
INFO Main execution: {duration}s
```

### Step 5: Run OTP Server

```bash
# Start OTP server
java -Xmx4G -jar otp-2.3.0.jar --load ghana/ --serve
```

**The server will start on `http://localhost:8080`**

**Verify it's working**:
```bash
# Open in your browser
http://localhost:8080

# You should see the OTP web interface
```

### Step 6: Configure GoTrotro to Use Local OTP

Your `.env` should already have:
```env
REACT_APP_OTP_API=http://localhost:8080/otp/routers/default/plan
```

### Step 7: Test the Integration

1. Start OTP server (as in Step 5)
2. In a new terminal, start GoTrotro:
   ```bash
   cd /path/to/gotrotro
   npm start
   ```
3. Search for a route in Accra
4. You should see transit routes with real schedules!

### Running OTP as a Background Service

#### macOS/Linux (using systemd)

Create `/etc/systemd/system/otp.service`:

```ini
[Unit]
Description=OpenTripPlanner Server
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/home/yourusername/otp
ExecStart=/usr/bin/java -Xmx4G -jar /home/yourusername/otp/otp-2.3.0.jar --load ghana/ --serve
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable otp
sudo systemctl start otp
sudo systemctl status otp
```

#### macOS (using launchd)

Create `~/Library/LaunchAgents/com.gotrotro.otp.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gotrotro.otp</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/java</string>
        <string>-Xmx4G</string>
        <string>-jar</string>
        <string>/Users/yourusername/otp/otp-2.3.0.jar</string>
        <string>--load</string>
        <string>ghana/</string>
        <string>--serve</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load and start:
```bash
launchctl load ~/Library/LaunchAgents/com.gotrotro.otp.plist
```

---

## Alternative Routing Engines

### Using OSRM Instead of OTP

If you don't need transit routing and only want road routing:

#### Edit `src/configuration/config.ts`:

```typescript
const appConfiguration: AppConfiguration = {
  // Change default from "otp" to "osrm"
  defaultRoutingEngine: "osrm",
  
  routingEngines: {
    "osrm": new OSRMAdapter(
      process.env.REACT_APP_OSRM_API || 'https://router.project-osrm.org',
      { profile: 'driving' }  // or 'walking', 'cycling'
    ),
    // ... other engines
  }
};
```

**Public OSRM server is good for**:
- Development and testing
- Road routing only (no public transit)
- Worldwide coverage

**Limitations**:
- No transit data
- Rate limited
- Shared with other users

### Using Valhalla

Valhalla supports multi-modal routing (car, bike, pedestrian):

```typescript
defaultRoutingEngine: "valhalla",
```

Public server: `https://valhalla1.openstreetmap.de`

---

## Database Setup (Optional)

GoTrotro doesn't require a database for basic functionality, but you might want one for:
- User accounts
- Saved routes
- Trip history
- Analytics

### Setting Up PostgreSQL

```bash
# Install PostgreSQL
# macOS
brew install postgresql@14

# Ubuntu
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux

# Create database
createdb gotrotro_dev
```

### Connection String

Add to `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gotrotro_dev
```

---

## IDE Configuration

### VS Code (Recommended)

#### Install Extensions

```bash
# Install via command palette (Cmd/Ctrl+P)
ext install dbaeumer.vscode-eslint
ext install esbenp.prettier-vscode
ext install bradlc.vscode-tailwindcss
ext install ms-vscode.vscode-typescript-next
```

#### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### IntelliJ IDEA / WebStorm

1. Open project
2. Right-click `package.json` → "Show npm Scripts"
3. Enable TypeScript service
4. Install Tailwind CSS plugin

---

## Troubleshooting Setup Issues

### Issue: `npm install` Fails

**Symptoms**: Errors during `npm install`

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Issue: OTP Won't Start

**Symptoms**: Java errors when starting OTP

**Solutions**:
```bash
# Check Java version (must be 11+)
java -version

# Increase memory if needed
java -Xmx8G -jar otp-2.3.0.jar --load ghana/ --serve

# Check for port conflicts
lsof -i :8080
# Kill the process if needed
kill -9 <PID>
```

### Issue: Map Not Loading

**Symptoms**: Blank map or "Invalid API Key" error

**Solutions**:
1. Verify MapTiler API key in `.env`
2. Ensure variable name is exactly `REACT_APP_MAPTILER_TOKEN`
3. Restart dev server after changing `.env`
4. Check browser console for specific error messages

### Issue: CORS Errors

**Symptoms**: "CORS policy" errors in browser console

**Solutions**:
- For local OTP, this shouldn't happen
- For custom routing servers, ensure CORS is enabled
- Add proxy in `package.json`:
  ```json
  {
    "proxy": "http://localhost:8080"
  }
  ```

---

## Next Steps

Now that your environment is set up:

1. **Read the Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Configure Your Setup**: [CONFIGURATION.md](./CONFIGURATION.md)
3. **Explore Adapters**: [API_ADAPTERS.md](./API_ADAPTERS.md)
4. **Start Developing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Additional Resources

- [OpenTripPlanner Documentation](https://docs.opentripplanner.org/)
- [OSRM Backend](http://project-osrm.org/)
- [Valhalla Documentation](https://valhalla.readthedocs.io/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/api/)

