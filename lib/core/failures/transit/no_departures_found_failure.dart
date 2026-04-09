import 'package:station_reach/core/failures/transit/transit_failure.dart';

/// {@template no_departures_found_failure}
/// A failure that occurs when no departures are found for a given station.
///
/// It usually occurs on a bug in the Transitous API. (for more see [MapRemoteDataSource])
/// {@endtemplate}
class NoDeparturesFoundFailure extends TransitFailure {
  /// {@macro no_departures_found_failure}
  const NoDeparturesFoundFailure()
    : super(
        name: 'No Departures Found',
        message: 'No departures found for the given station.',
        code: 'no_departures_found',
      );
}
