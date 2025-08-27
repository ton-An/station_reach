import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:maplibre/maplibre.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/cubits/station_search_cubit/station_search_states.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_cubit.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_states.dart';
import 'package:station_reach/secrets.dart';
import 'package:station_reach/widgets/icon_button.dart';
import 'package:url_launcher/url_launcher_string.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

part '_attribution_legend.dart';
part '_controls.dart';
part '_map.dart';
part '_scale_bar.dart';
part '_search.dart';

class MapPage extends StatelessWidget {
  const MapPage({super.key});

  static const String pageName = 'map';
  static const String route = '/$pageName';

  @override
  Widget build(BuildContext context) {
    return BlocListener<StationSearchCubit, StationSearchState>(
      listener: (context, state) {
        if (state is StationSearchStateFailure) {
          context.read<InAppNotificationCubit>().sendFailureNotification(
            state.failure,
          );
        }
      },
      child: BlocBuilder<StationReachabilityCubit, StationReachabilityState>(
        builder: (context, state) {
          return Scaffold(body: Stack(children: [_Map(), _Search()]));
        },
      ),
    );
  }
}
