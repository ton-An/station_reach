import 'package:station_reach/core/failures/transit/transit_failure.dart';

class NoDeparturesFoundFailure extends TransitFailure {
  const NoDeparturesFoundFailure()
    : super(
        name: 'No Departures Found',
        message: 'No departures found for the given station.',
        code: 'no_departures_found',
      );
}
