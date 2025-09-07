import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/usecases/search_stations.dart';
import 'package:station_reach/features/map/presentation/cubits/station_search_cubit/station_search_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class StationSearchCubit extends Cubit<StationSearchState> {
  StationSearchCubit({required this.searchStationsUsecase})
    : super(StationSearchStateInitial());

  final SearchStations searchStationsUsecase;

  Future<void> searchStations(String query) async {
    List<Station> previousStations = [];

    if (state is StationSearchDataState) {
      previousStations = (state as StationSearchDataState).stations;
    }

    emit(StationSearchStateLoading(stations: previousStations));

    final Either<Failure, List<Station>> searchStationsEither =
        await searchStationsUsecase(query: query);

    searchStationsEither.fold(
      (failure) => emit(StationSearchStateFailure(failure: failure)),
      (stations) => emit(StationSearchStateSuccess(stations: stations)),
    );
  }

  void collapseSearch() {
    emit(StationSearchStateInitial());
  }
}
