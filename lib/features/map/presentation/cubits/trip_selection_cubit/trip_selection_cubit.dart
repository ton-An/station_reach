import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/presentation/cubits/trip_selection_cubit/trip_selection_states.dart';

class TripSelectionCubit extends Cubit<TripSelectionState> {
  TripSelectionCubit() : super(TripSelectionStateUnselected());

  void selectTrip(Departure trip) {
    emit(TripSelectionStateSelected(trip: trip));
  }

  void unselectTrip() {
    emit(TripSelectionStateUnselected());
  }
}
