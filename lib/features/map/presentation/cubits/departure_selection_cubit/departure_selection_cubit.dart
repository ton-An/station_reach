import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/presentation/cubits/departure_selection_cubit/departure_selection_states.dart';

/// {@template departure_selection_cubit}
/// Manages the selection of a [Departure]
///
/// States:
/// - [NoDepartureSelected]: No departure selected
/// - [DepartureSelected]: A departure selected
/// {@endtemplate}
class DepartureSelectionCubit extends Cubit<DepartureSelectionState> {
  /// {@macro departure_selection_cubit}
  DepartureSelectionCubit() : super(NoDepartureSelected());

  /// Selects a [Departure]
  ///
  /// Parameters:
  /// - departure: The [Departure] to select
  ///
  /// Emits:
  /// - [DepartureSelected]
  void selectDeparture(Departure departure) {
    emit(DepartureSelected(departure: departure));
  }

  /// Deselects the selected [Departure]
  ///
  /// Emits:
  /// - [NoDepartureSelected]
  void deselectDeparture() {
    emit(NoDepartureSelected());
  }
}
