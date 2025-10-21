import 'dart:math';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/core/helpers/color_helper.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';
import 'package:station_reach/features/map/presentation/cubits/trip_selection_cubit/trip_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/trip_selection_cubit/trip_selection_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

part '_single_trip_itinerary.dart';
part '_time_gradient_legend.dart';
part '_transport_mode_icon.dart';
part '_trip_page_link.dart';
part '_trips_list.dart';

class HighlightedTripsModal extends StatefulWidget {
  const HighlightedTripsModal({super.key});

  @override
  State<HighlightedTripsModal> createState() => _HighlightedTripsModalState();
}

class _HighlightedTripsModalState extends State<HighlightedTripsModal> {
  late PageController pageController;

  Departure? _selectedTrip;

  @override
  void initState() {
    super.initState();
    pageController = PageController();

    pageController.addListener(() {
      if (pageController.page == 0) {
        context.read<TripSelectionCubit>().unselectTrip();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return BlocConsumer<TripSelectionCubit, TripSelectionState>(
      listener: (context, tripSelectionState) {
        if (tripSelectionState is TripSelectionStateSelected) {
          setState(() {
            _selectedTrip = tripSelectionState.trip;
          });

          pageController.animateToPage(
            1,
            duration: const Duration(milliseconds: 240),
            curve: Curves.easeOut,
          );
        }

        if (tripSelectionState is TripSelectionStateUnselected) {
          pageController.animateTo(
            0,
            duration: const Duration(milliseconds: 240),
            curve: Curves.easeOut,
          );
        }
      },
      builder: (context, tripSelectionState) {
        return BlocBuilder<StationSelectionCubit, StationSelectionState>(
          builder: (context, stationSelectionState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: WebfabrikModal(
                title: tripSelectionState is TripSelectionStateSelected
                    ? _selectedTrip?.name ?? ''
                    : stationSelectionState is StationSelectedState
                    ? stationSelectionState.station.name
                    : 'Trips',
                displayBackButton:
                    tripSelectionState is TripSelectionStateSelected,
                onBackPressed: () {
                  context.read<TripSelectionCubit>().unselectTrip();
                },
                secondaryButtons: const [],
                legend: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const _TimeGradientLegend(),
                    AttributionLegend(
                      additionalWidgets: [
                        OSSInfo(
                          repositoryUrl:
                              'https://github.com/ton-An/station_reach',
                        ),
                      ],
                      attributions: [
                        Attribution(
                          name: AppLocalizations.of(
                            context,
                          )!.openStreetMapAttribution,
                          url: 'https://www.openstreetmap.org/copyright',
                        ),
                        Attribution(
                          name: AppLocalizations.of(
                            context,
                          )!.dataSourcesAttribution,
                          url: 'https://transitous.org/sources/',
                        ),
                        Attribution(
                          name: AppLocalizations.of(
                            context,
                          )!.transitousAttribution,
                          url: 'https://transitous.org/',
                        ),
                      ],
                    ),
                  ],
                ),
                builder: (context, scrollController) => PageView(
                  controller: pageController,
                  physics: tripSelectionState is TripSelectionStateSelected
                      ? null
                      : const NeverScrollableScrollPhysics(),
                  children: [
                    _TripsList(scrollController: scrollController),
                    _SingleTripItinerary(
                      trip: _selectedTrip,
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
}
