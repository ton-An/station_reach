import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class MapRepository {
  /// Searches for stations by name.
  ///
  /// Parameters:
  /// - query: Query [String] to search for
  ///
  /// Returns:
  /// - [List] of [Station]s found
  ///
  /// Failures:
  /// {@macro converted_dio_exceptions}
  Future<Either<Failure, List<Station>>> searchStations({
    required String query,
  });

  /// Gets the departures for a station by mode.
  ///
  /// Parameters:
  /// - station: [Station] to get the departures for
  /// - modes: [List] of [TransitMode]s to get the departures for
  /// - amount: [int] number of departures to get
  ///
  /// Returns:
  /// - [List] of [Departure]s found
  ///
  /// Failures:
  /// - [NoDeparturesFoundFailure]
  /// {@macro converted_dio_exceptions}
  Future<Either<Failure, List<Departure>>> getStationDeparturesByMode({
    required Station station,
    required List<TransitMode> modes,
    required int amount,
  });
}
