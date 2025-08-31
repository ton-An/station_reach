import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/constants.dart';
import 'package:station_reach/core/failure_handler.dart';
import 'package:station_reach/core/failures/networking/status_code_not_ok_failure.dart';
import 'package:station_reach/core/failures/networking/unknown_request_failure.dart';
import 'package:station_reach/cubits/station_search_cubit/station_search_states.dart';
import 'package:station_reach/models/station.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class StationSearchCubit extends Cubit<StationSearchState> {
  StationSearchCubit({required this.dio, required this.failureHandler})
    : super(StationSearchStateInitial());

  final Dio dio;
  final FailureHandler failureHandler;

  Future<void> searchStations(String query) async {
    RegExp queryNormalizer = RegExp(
      r'([+ - && || ! ( ) { } \[ \] ^ " ~ * ? : \\ /])',
    );

    final String normalizedQuery = query.replaceAll(queryNormalizer, '');

    if (normalizedQuery.isEmpty) {
      emit(StationSearchStateSuccess(stations: const []));
      return;
    }

    List<Station> previousStations = [];

    if (state is StationSearchDataState) {
      previousStations = (state as StationSearchDataState).stations;
    }

    emit(StationSearchStateLoading(stations: previousStations));

    final Uri url = Uri.parse(
      '${Constants.apiUrl}geocode/stopClusters?query=$normalizedQuery',
    );

    try {
      List locations = [];

      final Response response = await dio.getUri(url);

      if (response.statusCode == HttpStatus.ok) {
        locations = response.data;
      } else if (response.statusCode != null &&
          response.statusCode != HttpStatus.ok) {
        throw StatusCodeNotOkFailure(statusCode: response.statusCode!);
      } else {
        throw const UnknownRequestFailure();
      }

      final List<Station> stations = locations.map((location) {
        return Station.fromJson(location);
      }).toList();

      emit(StationSearchStateSuccess(stations: stations));
    } on DioException catch (dioException) {
      final Failure failure = failureHandler.dioExceptionMapper(
        dioException: dioException,
      );

      emit(StationSearchStateFailure(failure: failure));
    } on Failure catch (failure) {
      emit(StationSearchStateFailure(failure: failure));
    }
  }

  void collapseSearch() {
    emit(StationSearchStateInitial());
  }
}
