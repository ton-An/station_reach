import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:station_reach/core/data/repository/failure_handler.dart';
import 'package:station_reach/features/map/data/datasources/map_remote_data_source.dart';
import 'package:station_reach/features/map/data/repository_implementations/map_repository_impl.dart';
import 'package:station_reach/features/map/domain/repositories/map_repository.dart';
import 'package:station_reach/features/map/domain/usecases/get_station_reachability.dart';
import 'package:station_reach/features/map/domain/usecases/search_stations.dart';
import 'package:station_reach/features/map/presentation/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_reachability_cubit/station_reachability_cubit.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

final GetIt getIt = GetIt.instance;

void initGetIt() {
  // -- Core -- //
  getIt.registerSingleton<FailureHandler>(FailureHandlerImpl());

  // -- Presentation -- //
  getIt.registerFactory(() => InAppNotificationCubit());
  getIt.registerFactory(
    () => StationSearchCubit(searchStationsUsecase: getIt()),
  );
  getIt.registerFactory(
    () => StationReachabilityCubit(getStationReachability: getIt()),
  );
  getIt.registerFactory(() => StationSelectionCubit());

  // -- Domain -- //
  getIt.registerFactory(() => SearchStations(mapRepository: getIt()));
  getIt.registerFactory(() => GetStationReachability(mapRepository: getIt()));

  // -- Data -- //
  getIt.registerFactory<MapRepository>(
    () => MapRepositoryImpl(
      mapRemoteDataSource: getIt(),
      failureHandler: getIt(),
    ),
  );
  getIt.registerFactory<MapRemoteDataSource>(
    () => MapRemoteDataSourceImpl(dio: getIt()),
  );

  // -- Third Party -- //
  getIt.registerSingleton<Dio>(Dio());
}
