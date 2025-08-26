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
    if (query.isNotEmpty) {
      emit(StationSearchStateLoading());

      final Uri url = Uri.parse('${Constants.apiUrl}/locations?query=$query');

      List locations = [];

      try {
        final Response response = await dio.getUri(url);

        if (response.statusCode == HttpStatus.ok) {
          locations = response.data;
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

        emit(StationSearchStateFailure(failure: failure));
      } on Failure catch (failure) {
        emit(StationSearchStateFailure(failure: failure));
      }

      final List<Station> stations = locations
          .map((location) => Station.fromJson(location))
          .toList();

      emit(StationSearchStateSuccess(stations: stations));
    }
  }
}
