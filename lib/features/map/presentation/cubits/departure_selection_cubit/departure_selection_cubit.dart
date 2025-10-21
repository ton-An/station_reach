import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/presentation/cubits/departure_selection_cubit/departure_selection_states.dart';

class DepartureSelectionCubit extends Cubit<DepartureSelectionState> {
  DepartureSelectionCubit() : super(NoDepartureSelected());

  void selectDeparture(Departure departure) {
    emit(DepartureSelected(departure: departure));
  }

  void unselectTrip() {
    emit(NoDepartureSelected());
  }
}
