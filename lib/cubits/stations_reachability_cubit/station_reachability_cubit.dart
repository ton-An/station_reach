// https://v6.db.transport.rest/stops/8010159/departures?duration=12220&stopovers=true&profile=dbweb

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/constants.dart';
import 'package:station_reach/core/failure_handler.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_states.dart';
import 'package:station_reach/models/station.dart';
import 'package:station_reach/models/trip.dart';

class StationReachabilityCubit extends Cubit<StationReachabilityState> {
  StationReachabilityCubit({required this.failureHandler, required this.dio})
    : super(StationReachabilityStateInitial());

  final FailureHandler failureHandler;
  final Dio dio;

  Future<void> getReachability(Station station) async {
    emit(StationReachabilityStateLoading());

    const String query = '''
query (\$stopIds: [String!]!, \$start: Long!, \$range: Int!) {
  stops(ids: \$stopIds) {
    gtfsId
    name
    stoptimesForPatterns(
      startTime: \$start
      timeRange: \$range
      numberOfDepartures: 1
      omitNonPickups: false
    ) {
      pattern {
        id
        route { shortName longName }
      }
      stoptimes {
        serviceDay
        scheduledDeparture
        scheduledArrival
        headsign
        trip {
          gtfsId
          stoptimes {
            stop { gtfsId name lat lon }
            scheduledArrival
          }
        }
      }
    }
  }
}
''';

    final List<String> stopIds = [station.id, ...station.childrenIds];

    final url = Uri.parse('${Constants.apiUrl}gtfs/v1');

    final Map<String, dynamic> queryVariables = {
      'stopIds': stopIds,
      'start': 0,
      'range': 86400,
    };

    final response = await dio.postUri(
      url,
      options: Options(
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
      data: {'query': query, 'variables': queryVariables},
    );

    final List stations = response.data['data']['stops'] as List;

    stations.removeWhere((station) => station == null);

    final List<Trip> trips = [];

    for (final Map station in stations) {
      for (final Map stoptimesForPattern in station['stoptimesForPatterns']) {
        trips.add(Trip.fromJson(stoptimesForPattern));
      }
    }

    emit(StationReachabilityStateSuccess(trips: trips));
  }
}
