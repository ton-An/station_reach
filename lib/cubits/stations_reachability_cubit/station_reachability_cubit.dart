// https://v6.db.transport.rest/stops/8010159/departures?duration=12220&stopovers=true&profile=dbweb

import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/constants.dart';
import 'package:station_reach/core/failure_handler.dart';
import 'package:station_reach/core/failures/networking/status_code_not_ok_failure.dart';
import 'package:station_reach/core/failures/networking/unknown_request_failure.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_states.dart';
import 'package:station_reach/models/station.dart';
import 'package:station_reach/models/trip.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

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
        route {
          shortName
          mode
          type
          agency { id name }
        }
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

    final url = Uri.parse('${Constants.otpUrl}gtfs/v1');

    final Map<String, dynamic> queryVariables = {
      'stopIds': stopIds,
      'start': 0,
      'range': 86400,
    };

    try {
      final Response response = await dio.postUri(
        url,
        options: Options(
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
        data: {'query': query, 'variables': queryVariables},
      );

      List stations = [];

      if (response.statusCode == HttpStatus.ok) {
        stations = response.data['data']['stops'] as List;
      } else if (response.statusCode != null &&
          response.statusCode != HttpStatus.ok) {
        throw StatusCodeNotOkFailure(statusCode: response.statusCode!);
      } else {
        throw const UnknownRequestFailure();
      }

      stations.removeWhere((station) => station == null);

      final List<Trip> trips = [];

      for (final Map station in stations) {
        for (final Map stoptimesForPattern in station['stoptimesForPatterns']) {
          trips.add(Trip.fromJson(stoptimesForPattern));
        }
      }

      emit(StationReachabilityStateSuccess(trips: trips));
    } on DioException catch (dioException) {
      final Failure failure = failureHandler.dioExceptionMapper(
        dioException: dioException,
      );

      emit(StationReachabilityStateFailure(failure: failure));
    } on Failure catch (failure) {
      emit(StationReachabilityStateFailure(failure: failure));
    }
  }
}
