import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:pointer_interceptor/pointer_interceptor.dart';
import 'package:shimmer_animation/shimmer_animation.dart';
import 'package:station_reach/core/helpers/color_helper.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/core/widgets/fade_gesture_detector.dart';
import 'package:station_reach/features/map/domain/models/departure.dart';
import 'package:station_reach/features/map/domain/models/stop.dart';
import 'package:station_reach/features/map/presentation/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_search_cubit/station_search_states.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_states.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_departures_cubit/station_departures_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_departures_cubit/station_departures_states.dart';
import 'package:station_reach/features/map/presentation/widgets/highlighted_departures_modal/highlighted_departures_modal.dart';
import 'package:station_reach/features/map/presentation/widgets/multi_polyline_layer/multi_polyline_layer.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

part '_map.dart';
part '_map_departures_polyline_layer.dart';
part '_map_station_marker_layer.dart';
part '_search.dart';
part '_search_field.dart';
part '_search_loading_shimmer.dart';
part '_search_results.dart';

class MapPage extends StatelessWidget {
  const MapPage({super.key});

  static const String pageName = 'map';
  static const String route = '/$pageName';

  @override
  Widget build(BuildContext context) {
    return BlocListener<StationSearchCubit, StationSearchState>(
      listener: (context, searchState) {
        if (searchState is StationSearchStateFailure) {
          context.read<InAppNotificationCubit>().sendFailureNotification(
            searchState.failure,
          );
        }
      },
      child: BlocListener<StationDeparturesCubit, StationDeparturesState>(
        listener: (context, reachabilityState) {
          if (reachabilityState is StationDeparturesFailure) {
            context.read<InAppNotificationCubit>().sendFailureNotification(
              reachabilityState.failure,
            );
          }
        },
        child: const Scaffold(
          resizeToAvoidBottomInset: false,
          body: Stack(
            children: [
              _Map(),
              Positioned.fill(
                child: Column(
                  children: [
                    _Search(),
                    Expanded(child: HighlightedDeparturesModal()),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
