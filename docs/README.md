# GoTrotro Developer Documentation

**GoTrotro** is a flexible, extensible public transit routing application for Ghana, built with React, TypeScript, and MapLibre. The application uses an adapter pattern to support multiple routing engines and geocoding services, making it highly customizable and maintainable.

## 📚 Documentation Index

### Getting Started
- **[Getting Started Guide](./GETTING_STARTED.md)** - Quick start for new developers
- **[Setup & Installation](./SETUP.md)** - Detailed setup instructions
- **[Configuration Guide](./CONFIGURATION.md)** - How to configure the application

### Core Concepts
- **[Architecture Overview](./ARCHITECTURE.md)** - System design, patterns, and data flow
- **[API Adapters](./API_ADAPTERS.md)** - Routing engines and geocoding services
- **[Component Guide](./COMPONENTS.md)** - React component documentation

### Operations
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](./CONTRIBUTING.md)** - How to contribute to the project

### Reference
- **[API Reference](./API_REFERENCE.md)** - TypeScript interfaces and types

---

## 🎯 Key Features

- **Multi-Engine Routing**: Switch between OTP, OSRM, and Valhalla routing engines
- **Flexible Geocoding**: Use Nominatim, Photon, or custom geocoding services
- **Interactive Maps**: MapLibre-powered maps with real-time route visualization
- **Transit Instructions**: Step-by-step route guidance with transfer information
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Type-Safe**: Built with TypeScript for reliability and maintainability

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript 4.9** - Type safety
- **TanStack Query** - Data fetching and caching
- **React Router** - Navigation

### Mapping
- **MapLibre GL JS** - Map rendering
- **react-map-gl** - React wrapper for MapLibre
- **MapTiler** - Map tiles provider

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Component-scoped styling

### Routing Services
- **OpenTripPlanner (OTP)** - Transit routing (primary)
- **OSRM** - Road routing
- **Valhalla** - Multi-modal routing

### Geocoding Services
- **Nominatim** - OSM-based geocoding (primary)
- **Photon** - Fast geocoding alternative

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/gotrotro.git
cd gotrotro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

Visit `http://localhost:3000` to see the application.

For detailed setup instructions, see [SETUP.md](./SETUP.md).

---

## 📁 Project Structure

```
gotrotro/
├── docs/                      # Documentation
├── public/                    # Static assets
├── src/
│   ├── adapters/              # Routing & geocoding adapters
│   │   ├── routingEngines/    # OTP, OSRM, Valhalla adapters
│   │   └── geocoders/         # Nominatim, Photon adapters
│   ├── components/            # React components
│   ├── configuration/         # App configuration
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   ├── queries/               # TanStack Query hooks
│   ├── services/              # Business logic services
│   ├── styles/                # CSS files
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── App.tsx                # Root component
│   └── index.tsx              # Application entry point
├── .env.example               # Environment variables template
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript configuration
```

---

## 🎨 Design Patterns

### Adapter Pattern
The application uses the Adapter pattern to abstract routing engines and geocoding services:

```typescript
// All routing engines implement this interface
interface RoutingAdapter {
  getRoute(request: RoutingRequest): Promise<Itinerary[]>;
}

// All geocoders implement this interface
interface GeocoderAdapter {
  search(query: string, options?: GeocoderSearchOptions): Promise<LocationResult[]>;
}
```

This allows you to:
- Switch between services without code changes
- Add new services by implementing the interface
- Test with mock adapters

See [ARCHITECTURE.md](./ARCHITECTURE.md) for more details.

---

## 🔧 Configuration

The application is configured via `src/configuration/config.ts`:

```typescript
const appConfiguration: AppConfiguration = {
  appName: "GoTrotro",
  
  // Routing engines
  defaultRoutingEngine: "otp",
  routingEngines: {
    "otp": new OtpAdapter(process.env.REACT_APP_OTP_API),
    "osrm": new OSRMAdapter(process.env.REACT_APP_OSRM_API),
    "valhalla": new ValhallaAdapter(process.env.REACT_APP_VALHALLA_API)
  },
  
  // Geocoding services
  defaultGeocoder: "nominatim",
  geocoders: {
    "nominatim": new NominatimAdapter(/* ... */),
    "photon": new PhotonAdapter(/* ... */)
  }
};
```

See [CONFIGURATION.md](./CONFIGURATION.md) for complete configuration options.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- Pull request process
- Testing requirements
- Documentation standards

---

## 📄 License

[Add your license information here]

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gotrotro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gotrotro/discussions)
- **Email**: [your-email@example.com]

---

## 🙏 Acknowledgments

- OpenStreetMap contributors for map data
- OpenTripPlanner community
- MapLibre community
- All contributors to this project

