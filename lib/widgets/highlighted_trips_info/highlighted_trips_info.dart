import 'package:flutter/widgets.dart';
import 'package:pointer_interceptor/pointer_interceptor.dart';
import 'package:station_reach/models/trip.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

part '_trip_selector.dart';

class HighlightedTripsInfo extends StatefulWidget {
  const HighlightedTripsInfo({required this.trips});

  final List<Trip> trips;

  @override
  State<HighlightedTripsInfo> createState() => _HighlightedTripsInfoState();
}

class _HighlightedTripsInfoState extends State<HighlightedTripsInfo> {
  late Trip _selectedTrip;

  @override
  void initState() {
    super.initState();
    _selectedTrip = widget.trips.first;
  }

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return PointerInterceptor(
      child: Padding(
        padding: EdgeInsets.all(theme.spacing.medium),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(theme.radii.medium),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 600, maxHeight: 300),
            color: theme.colors.translucentBackground,
            padding: EdgeInsets.all(theme.spacing.medium),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              children: [
                Expanded(
                  flex: 1,
                  child: ListView.builder(
                    itemCount: widget.trips.length,
                    itemBuilder: (context, index) => _TripSelector(
                      trips: widget.trips,
                      isSelected: _selectedTrip == widget.trips[index],
                      onPressed: () {
                        setState(() {
                          _selectedTrip = widget.trips[index];
                        });
                      },
                    ),
                  ),
                ),
                MediumGap(),
                Expanded(
                  flex: 2,
                  child: ListView.builder(
                    itemCount: _selectedTrip.stops.length,
                    itemBuilder: (context, index) =>
                        Text(_selectedTrip.stops[index].name),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
