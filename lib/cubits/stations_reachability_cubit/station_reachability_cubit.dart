// https://v6.db.transport.rest/stops/8010159/departures?duration=12220&stopovers=true&profile=dbweb

import 'dart:convert';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'package:station_reach/constants.dart';
import 'package:station_reach/core/failure_handler.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_states.dart';
import 'package:station_reach/models/station.dart';
import 'package:station_reach/models/trip.dart';

class StationReachabilityCubit extends Cubit<StationReachabilityState> {
  StationReachabilityCubit({required this.failureHandler})
    : super(StationReachabilityStateInitial());

  final FailureHandler failureHandler;

  Future<void> getReachability(Station station) async {
    emit(StationReachabilityStateLoading());

    final String query = '''
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

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({'query': query, 'variables': queryVariables}),
    );

    final Map<String, dynamic> responseBody = jsonDecode(response.body);

    final List stations = responseBody['data']['stops'] as List;

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
