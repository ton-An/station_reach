import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';
import 'package:station_reach/core/failure_handler.dart';
import 'package:station_reach/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_cubit.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

final GetIt getIt = GetIt.instance;

void initGetIt() {
  // -- Core -- //
  getIt.registerSingleton<FailureHandler>(FailureHandlerImpl());

  // -- Presentation -- //
  getIt.registerFactory(() => InAppNotificationCubit());
  getIt.registerFactory(
    () => StationSearchCubit(dio: getIt(), failureHandler: getIt()),
  );
  getIt.registerFactory(
    () => StationReachabilityCubit(failureHandler: getIt(), dio: getIt()),
  );

  // -- Third Party -- //
  getIt.registerSingleton<Dio>(Dio());
}
