import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fpdart/fpdart.dart';
import 'package:station_reach/features/map/domain/models/station.dart';
import 'package:station_reach/features/map/domain/usecases/search_stations.dart';
import 'package:station_reach/features/map/presentation/cubits/station_search_cubit/station_search_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/// {@template station_search_cubit}
/// Manages the search for stations
///
/// States:
/// - [StationSearchStateInitial]: Initial state
/// - [StationSearchStateLoading]: Loading state
/// - [StationSearchStateData]: Data state
/// - [StationSearchStateFailure]: Failure state
/// {@endtemplate}
class StationSearchCubit extends Cubit<StationSearchState> {
  /// {@macro station_search_cubit}
  StationSearchCubit({required this.searchStationsUsecase})
    : super(StationSearchStateInitial());

  final SearchStations searchStationsUsecase;

  /// Searches for stations
  ///
  /// Parameters:
  /// - query: The query [String] to search for
  ///
  /// Emits:
  /// - [StationSearchStateLoading]
  /// - [StationSearchStateLoaded]
  /// - [StationSearchStateFailure]
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
      (stations) => emit(StationSearchStateLoaded(stations: stations)),
    );
  }

  /// Collapses the search
  ///
  /// Emits:
  /// - [StationSearchStateInitial]
  void collapseSearch() {
    emit(StationSearchStateInitial());
  }
}
