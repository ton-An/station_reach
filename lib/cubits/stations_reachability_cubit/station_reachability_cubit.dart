// https://v6.db.transport.rest/stops/8010159/departures?duration=12220&stopovers=true&profile=dbweb

import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/constants.dart';
import 'package:station_reach/core/failure_handler.dart';
import 'package:station_reach/core/failures/networking/status_code_not_ok_failure.dart';
import 'package:station_reach/core/failures/networking/unknown_request_failure.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_states.dart';
import 'package:station_reach/models/trip.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class StationReachabilityCubit extends Cubit<StationReachabilityState> {
  StationReachabilityCubit({required this.dio, required this.failureHandler})
    : super(StationReachabilityStateInitial());

  final Dio dio;
  final FailureHandler failureHandler;

  Future<void> getReachability(String stationId) async {
    emit(StationReachabilityStateLoading());

    final Uri url = Uri.parse(
      '${Constants.apiUrl}/stops/$stationId/departures?duration=1440&stopovers=true&profile=dbweb',
    );

    List tripsResponse = [];

    try {
      final Response response = await dio.getUri(url);

      if (response.statusCode == HttpStatus.ok) {
        tripsResponse = response.data['departures'];
      } else if (response.statusCode != null &&
          response.statusCode != HttpStatus.ok) {
        throw StatusCodeNotOkFailure(statusCode: response.statusCode!);
      } else {
        throw UnknownRequestFailure();
      }
    } on DioException catch (diaException) {
      final Failure failure = failureHandler.dioExceptionMapper(
        dioException: diaException,
      );

      emit(StationReachabilityStateFailure(failure: failure));
    } on Failure catch (failure) {
      emit(StationReachabilityStateFailure(failure: failure));
    }

    final List<Trip> trips = tripsResponse
        .map((trip) => Trip.fromJson(trip))
        .toList();

    emit(StationReachabilityStateSuccess(trips: trips));
  }
}
