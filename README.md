<p align="center">
  <img src="logo.png" width="150" />
</p>

<h1 align="center">Station Reach</h1>

<p align="center">
  A Flutter app that helps users discover public transit stations and visualize their reach on a map.
</p>

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" />
  </a>
  <a href="https://github.com/ton-An/fernwaerts/stargazers">
    <img src="https://img.shields.io/github/stars/ton-An/station_reach?style=social" />
  </a>
</p>

<div align="center">
  <a href="https://station-reach.eu">Homepage</a> • 
  <s>Planning</s> • 
  <s>Documentation</s>
</div>


## Screenshots

*Screenshots will be added here*

## Getting Started (Development)

> 🚧 Only the web version is supported at the moment

### Prerequisites

- Flutter & Dart SDK (https://docs.flutter.dev/get-started/install)
- MapTiler API key (https://www.maptiler.com/)
- OpenTripPlanner Endpoint (production server: https://api.station-reach.eu - third party usage permitted for development only)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/station_reach.git
   cd station_reach
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run -d chrome --dart-define=MAPTILER_KEY=your_maptiler_api_key_here --dart-define=OTP_URL=your_otp_endpoint_here
   ```

### Building for Production

#### Web
```bash
flutter build web --wasm --release
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [MapLibre](https://github.com/josxha/flutter-maplibre) for the mapping engine
- [MapTiler](https://www.maptiler.com/) for map tiles
- [Transitous](https://transitous.org/) for transit data processing
- [Transit Data Sources](https://transitous.org/sources/)
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map data