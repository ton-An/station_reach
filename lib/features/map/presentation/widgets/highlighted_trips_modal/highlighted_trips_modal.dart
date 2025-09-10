import 'dart:math';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:station_reach/core/helpers/color_helper.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/features/map/domain/enums/transit_mode.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

part '_time_gradient_legend.dart';
part '_transport_mode_icon.dart';
part '_trip_page_link.dart';

class HighlightedTripsModal extends StatelessWidget {
  const HighlightedTripsModal();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return BlocBuilder<StationSelectionCubit, StationSelectionState>(
      builder: (context, state) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: WebfabrikModal(
            title: 'Trips',
            secondaryButtons: const [],
            legend: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const _TimeGradientLegend(),
                AttributionLegend(
                  attributions: [
                    Attribution(
                      name: AppLocalizations.of(context)!.mapLibreAttribution,
                      url: 'https://maplibre.org/',
                    ),
                    Attribution(
                      name: AppLocalizations.of(context)!.mapTilerAttribution,
                      url: 'https://www.maptiler.com/',
                    ),
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
                      name: AppLocalizations.of(context)!.transitousAttribution,
                      url: 'https://transitous.org/',
                    ),
                  ],
                ),
              ],
            ),
            builder: (context, scrollController) =>
                state is StationSelectedState
                ? ListView.builder(
                    controller: scrollController,
                    itemCount: state.trips.length,
                    padding: EdgeInsets.all(theme.spacing.medium),
                    itemBuilder: (context, index) => _TripPageLink(
                      tripName: state.trips[index].name,
                      mode: state.trips[index].mode,
                      iconBackgroundColor: ColorHelper.interpolateColors(
                        theme.colors.timelineGradient,
                        index / max(state.trips.length - 1, 1),
                      ),
                      onPressed: () {
                        //   context.goNamed(
                        //     SingleTripPage.pageName,
                        //     arguments: state.trips[index],
                        //   );
                      },
                      showDivider: index != state.trips.length - 1,
                    ),
                  )
                : ListView(
                    controller: scrollController,
                    children: const [Text('No trips')],
                  ),
          ),
        );
      },
    );
  }
}
