import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:maplibre/maplibre.dart';
import 'package:station_reach/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/cubits/station_search_cubit/station_search_states.dart';
import 'package:station_reach/secrets.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class MapPage extends StatelessWidget {
  const MapPage({super.key});

  static const String pageName = 'map';
  static const String route = '/$pageName';

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);
    return BlocListener<StationSearchCubit, StationSearchState>(
      listener: (context, state) {
        if (state is StationSearchStateFailure) {
          context.read<InAppNotificationCubit>().sendFailureNotification(
            state.failure,
          );
        }
      },
      child: Scaffold(
        body: Stack(
          children: [
            MapLibreMap(
              options: MapOptions(
                initCenter: Position(9.17, 47.68),
                initZoom: 2,
                initStyle:
                    'https://api.maptiler.com/maps/streets-v2/style.json?key=${Secrets.maptilerKey}',
              ),
              children: const [
                MapScalebar(),
                SourceAttribution(),
                MapControlButtons(showTrackLocation: true),
                MapCompass(),
              ],
              onStyleLoaded: (style) {
                style.setProjection(MapProjection.globe);
              },
            ),
            Align(
              alignment: Alignment.topCenter,
              child: Container(
                margin: EdgeInsets.only(top: theme.spacing.xxMedium),
                width: 340,
                child: BlocBuilder<StationSearchCubit, StationSearchState>(
                  builder: (context, state) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(theme.radii.button),

                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: theme.colors.background.withValues(alpha: .93),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              height: 50,
                              child: CupertinoTextField(
                                style: theme.text.body,
                                placeholderStyle: theme.text.body.copyWith(
                                  color: theme.colors.text.withValues(
                                    alpha: .5,
                                  ),
                                ),
                                placeholder: 'Search Stations',
                                cursorHeight: 20,
                                padding: EdgeInsets.zero,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.zero,
                                  color: Colors.transparent,
                                ),
                                onChanged: (String locationQuery) {
                                  context
                                      .read<StationSearchCubit>()
                                      .searchStations(locationQuery);
                                },
                                prefixMode: OverlayVisibilityMode.always,

                                prefix: Padding(
                                  padding: EdgeInsets.only(
                                    left: theme.spacing.xxSmall,
                                    right: theme.spacing.xSmall,
                                  ),
                                  child: Icon(
                                    Icons.search,
                                    color: theme.colors.text.withValues(
                                      alpha: .5,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            if (state is StationSearchStateSuccess &&
                                state.stations.isNotEmpty)
                              ConstrainedBox(
                                constraints: const BoxConstraints(
                                  maxHeight: 200,
                                ),
                                child: ListView.builder(
                                  itemCount: state.stations.length,
                                  shrinkWrap: true,
                                  itemBuilder: (context, index) {
                                    return FadeTapDetector(
                                      onTap: () {},
                                      child: Padding(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: theme.spacing.xSmall,
                                          vertical: theme.spacing.xSmall,
                                        ),
                                        child: Text(
                                          state.stations[index].name,
                                          style: theme.text.body,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
