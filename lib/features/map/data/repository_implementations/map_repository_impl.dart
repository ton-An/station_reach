import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/core/data/repository/failure_handler.dart';
import 'package:station_reach/features/map/data/datasources/map_remote_data_source.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/models/trip.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class MapRepositoryImpl extends MapRepository {
  MapRepositoryImpl({
    required this.mapRemoteDataSource,
    required this.failureHandler,
  });

  final MapRemoteDataSource mapRemoteDataSource;
  final FailureHandler failureHandler;
  @override
  Future<Either<Failure, List<Station>>> searchStations({
    required String query,
  }) async {
    try {
      final List<Station> stations = await mapRemoteDataSource.searchStations(
        query: query,
      );

      return Right(stations);
    } on DioException catch (dioException) {
      final Failure failure = failureHandler.dioExceptionMapper(
        dioException: dioException,
      );
      return Left(failure);
    }
  }

  @override
  Future<Either<Failure, List<Trip>>> getStationReachability({
    required Station station,
  }) async {
    try {
      final List<Trip> trips = await mapRemoteDataSource.getStationReachability(
        station: station,
      );
      return Right(trips);
    } on DioException catch (dioException) {
      final Failure failure = failureHandler.dioExceptionMapper(
        dioException: dioException,
      );
      return Left(failure);
    }
  }
}
