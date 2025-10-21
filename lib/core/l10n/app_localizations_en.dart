// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Station Reach';

  @override
  String get openStreetMapAttribution => '© OpenStreetMap';

  @override
  String get results => 'Results';

  @override
  String get searchStations => 'Search Stations';

  @override
  String get mapTilerAttribution => '© MapTiler';

  @override
  String get mapLibreAttribution => '© MapLibre';

  @override
  String get dataSourcesAttribution => 'Data Sources';

  @override
  String get transitousAttribution => 'Data processed by Transitous';

  @override
  String get thirtyMin => '30min';

  @override
  String get fourteenHoursPlus => '14h+';

  @override
  String get noStationSelected => 'No station selected';

  @override
  String get departures => 'Departures';
}
