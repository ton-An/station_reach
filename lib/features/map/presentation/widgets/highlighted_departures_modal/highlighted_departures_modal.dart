import 'dart:math';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/core/helpers/color_helper.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/presentation/cubits/departure_selection_cubit/departure_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/departure_selection_cubit/departure_selection_states.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_departures_cubit/station_departures_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_departures_cubit/station_departures_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

part '_attribution_legend.dart';
part '_departure_itinerary.dart';
part '_departure_list_item.dart';
part '_departures_list.dart';
part '_time_gradient_legend.dart';
part '_transport_mode_icon.dart';

class HighlightedDeparturesModal extends StatefulWidget {
  const HighlightedDeparturesModal({super.key});

  @override
  State<HighlightedDeparturesModal> createState() =>
      _HighlightedDeparturesModalState();
}

class _HighlightedDeparturesModalState
    extends State<HighlightedDeparturesModal> {
  late PageController pageController;

  Departure? _selectedDeparture;

  @override
  void initState() {
    super.initState();
    pageController = PageController();

    pageController.addListener(() {
      if (pageController.page == 0) {
        context.read<DepartureSelectionCubit>().deselectDeparture();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<DepartureSelectionCubit, DepartureSelectionState>(
      listener: (context, departureSelectionState) =>
          _handleDepartureSelection(departureSelectionState),
      builder: (context, departureSelectionState) {
        return BlocBuilder<StationSelectionCubit, StationSelectionState>(
          builder: (context, stationSelectionState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: WebfabrikModal(
                title: _getModalTitle(
                  departureSelectionState,
                  stationSelectionState,
                ),
                displayBackButton: departureSelectionState is DepartureSelected,
                onBackPressed: () {
                  context.read<DepartureSelectionCubit>().deselectDeparture();
                },
                secondaryButtons: const [],

                legend: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [_TimeGradientLegend(), _AttributionLegend()],
                ),
                builder: (context, scrollController) => PageView(
                  controller: pageController,
                  physics: departureSelectionState is DepartureSelected
                      ? null
                      : const NeverScrollableScrollPhysics(),
                  children: [
                    _DeparturesList(scrollController: scrollController),

                    _DeparturesItinerary(
                      departure: _selectedDeparture,
                      scrollController: scrollController,
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _handleDepartureSelection(
    DepartureSelectionState departureSelectionState,
  ) {
    if (departureSelectionState is DepartureSelected) {
      setState(() {
        _selectedDeparture = departureSelectionState.departure;
      });

      pageController.animateToPage(
        1,
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOut,
      );
    }

    if (departureSelectionState is NoDepartureSelected) {
      pageController.animateTo(
        0,
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeOut,
      );
    }
  }

  String _getModalTitle(
    DepartureSelectionState departureSelectionState,
    StationSelectionState stationSelectionState,
  ) {
    if (stationSelectionState is StationSelectedState) {
      return stationSelectionState.selectedStop.name;
    }

    if (departureSelectionState is DepartureSelected &&
        _selectedDeparture?.name != null) {
      return _selectedDeparture!.name;
    }

    return AppLocalizations.of(context)!.departures;
  }
}
