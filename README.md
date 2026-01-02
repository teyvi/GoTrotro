# GoTrotro

> A flexible, extensible public transit routing application for Ghana

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

GoTrotro is a modern web application for planning public transit routes in Ghana. Built with React and TypeScript, it uses an adapter pattern to support multiple routing engines and geocoding services, making it highly customizable and maintainable.

![GoTrotro Screenshot](./docs/assets/screenshot.png)

---

## ✨ Features

- **🚌 Multi-Modal Routing**: Plan routes using buses, walking, and transfers
- **🔄 Multiple Routing Engines**: Switch between OpenTripPlanner, OSRM, and Valhalla
- **📍 Flexible Geocoding**: Use Nominatim, Photon, or custom geocoding services
- **🗺️ Interactive Maps**: Beautiful MapLibre-powered maps with real-time visualization
- **📱 Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile
- **⚡ Performance Optimized**: Smart caching with TanStack Query
- **🔧 Developer Friendly**: Clean architecture, comprehensive documentation
- **🌍 Extensible**: Easy to add new routing engines and geocoding services

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
# Edit .env and add your MapTiler API key

# Start development server
npm start
```

Visit `http://localhost:3000` and start planning routes!

**New to the project?** → Read the [Getting Started Guide](./docs/GETTING_STARTED.md)

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

### For Users
- **[Getting Started](./docs/GETTING_STARTED.md)** - Set up and run the app in 10 minutes
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### For Developers
- **[Architecture Overview](./docs/ARCHITECTURE.md)** - System design and patterns
- **[Setup Guide](./docs/SETUP.md)** - Detailed installation and OTP setup
- **[Configuration Guide](./docs/CONFIGURATION.md)** - All configuration options
- **[API Adapters](./docs/API_ADAPTERS.md)** - Working with routing and geocoding adapters
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to contribute to the project

### Quick Links
- [📖 Full Documentation Index](./docs/README.md)
- [🐛 Report a Bug](https://github.com/yourusername/gotrotro/issues/new?template=bug_report.md)
- [💡 Request a Feature](https://github.com/yourusername/gotrotro/issues/new?template=feature_request.md)
- [💬 Discussions](https://github.com/yourusername/gotrotro/discussions)

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript 4.9
- **Mapping**: MapLibre GL JS, react-map-gl
- **Routing**: OpenTripPlanner, OSRM, Valhalla
- **Geocoding**: Nominatim, Photon
- **State Management**: TanStack Query, React Context
- **Styling**: Tailwind CSS
- **Build Tool**: Create React App

---

## 🎯 Project Structure

```
gotrotro/
├── docs/                      # 📚 Comprehensive documentation
├── public/                    # Static assets
├── src/
│   ├── adapters/              # 🔌 Routing & geocoding adapters
│   │   ├── routingEngines/    # OTP, OSRM, Valhalla adapters
│   │   └── geocoders/         # Nominatim, Photon adapters
│   ├── components/            # ⚛️ React components
│   ├── configuration/         # ⚙️ App configuration
│   ├── hooks/                 # 🪝 Custom React hooks
│   ├── pages/                 # 📄 Page components
│   ├── services/              # 💼 Business logic
│   ├── types/                 # 📝 TypeScript types
│   └── utils/                 # 🛠️ Utility functions
├── .env.example               # Environment variables template
└── README.md                  # This file
```

---

## 🤝 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

**Quick Contribution Steps**:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See our [Contributing Guide](./docs/CONTRIBUTING.md) for detailed instructions.

### Good First Issues

Looking for something to work on? Check out issues labeled:
- [`good first issue`](https://github.com/yourusername/gotrotro/labels/good%20first%20issue) - Great for beginners
- [`help wanted`](https://github.com/yourusername/gotrotro/labels/help%20wanted) - We need community help
- [`documentation`](https://github.com/yourusername/gotrotro/labels/documentation) - Improve our docs

---

## 🎨 Screenshots

### Route Planning
![Route Planning](./docs/assets/route-planning.png)

### Route Instructions
![Route Instructions](./docs/assets/route-instructions.png)

### Mobile View
![Mobile View](./docs/assets/mobile-view.png)

---

## 🌟 Key Concepts

### Adapter Pattern

GoTrotro uses the Adapter pattern to support multiple routing engines and geocoding services:

```typescript
// All routing engines implement this interface
interface RoutingAdapter {
  getRoute(request: RoutingRequest): Promise<Itinerary[]>;
}

// Switch between engines with one line
appConfiguration.defaultRoutingEngine = "otp";  // or "osrm", "valhalla"
```

This makes it easy to:
- ✅ Switch services without changing application code
- ✅ Add new services by implementing the interface
- ✅ Test with mock adapters
- ✅ Deploy with different configurations per environment

Learn more in our [Architecture Guide](./docs/ARCHITECTURE.md).

---

## 📊 Project Status

- ✅ Core routing functionality
- ✅ Multiple routing engine support (OTP, OSRM, Valhalla)
- ✅ Multiple geocoding services (Nominatim, Photon)
- ✅ Interactive map with route visualization
- ✅ Step-by-step route instructions
- ✅ Mobile responsive design
- ✅ Comprehensive documentation
- 🚧 User accounts (planned)
- 🚧 Saved routes (planned)
- 🚧 Real-time transit updates (planned)

---

## 🐛 Known Issues

- **Walk route geometry**: Walk segments may appear as straight lines if OTP server doesn't provide detailed geometry. See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md#walk-routes-appear-as-straight-lines).
- **Rate limiting**: Public Nominatim server has strict rate limits. Consider self-hosting for production.

See all issues on our [Issue Tracker](https://github.com/yourusername/gotrotro/issues).

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenStreetMap** contributors for map data
- **OpenTripPlanner** community for transit routing
- **MapLibre** community for mapping technology
- **Ghana Transit Agencies** for GTFS data
- All our [contributors](https://github.com/yourusername/gotrotro/graphs/contributors)

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gotrotro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gotrotro/discussions)
- **Email**: your-email@example.com

---

## 🚀 Deployment

Ready to deploy? Check our [Deployment Guide](./docs/DEPLOYMENT.md) for:
- Production builds
- Environment configuration
- Server setup
- Performance optimization

---

## 🗺️ Roadmap

### Q1 2026
- [ ] User authentication
- [ ] Saved favorite routes
- [ ] Route history

### Q2 2026
- [ ] Real-time transit updates
- [ ] Multi-language support
- [ ] Accessibility improvements

### Q3 2026
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Trip planning features

See our [full roadmap](https://github.com/yourusername/gotrotro/projects) for more details.

---

<div align="center">

**Made with ❤️ for Ghana**

[⭐ Star on GitHub](https://github.com/yourusername/gotrotro) • [🐛 Report Bug](https://github.com/yourusername/gotrotro/issues) • [💡 Request Feature](https://github.com/yourusername/gotrotro/issues)

</div>
