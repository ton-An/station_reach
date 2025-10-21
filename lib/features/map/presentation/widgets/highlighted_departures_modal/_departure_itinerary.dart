part of 'highlighted_departures_modal.dart';

class _DeparturesItinerary extends StatelessWidget {
  const _DeparturesItinerary({
    required Departure? departure,
    required this.scrollController,
  }) : _selectedDeparture = departure;

  final Departure? _selectedDeparture;
  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return ListView.builder(
      controller: scrollController,
      itemCount: _selectedDeparture!.stops.length,
      padding: EdgeInsets.all(theme.spacing.medium),
      itemBuilder: (context, index) {
        return Column(
          children: [
            WebfabrikListItem(
              title: _selectedDeparture!.stops[index].name,
              subtitle: TimeDateFormatter.formatDuration(
                _selectedDeparture!.stops[index].duration,
              ),
              icon: WebfabrikListIcon(
                iconData: WebfabrikIconData(
                  icon: Icons.location_on,
                  color: ColorHelper.interpolateColors(
                    theme.colors.timelineGradient,
                    (_selectedDeparture!.stops[index].duration.inMinutes ~/ 30)
                            .clamp(0, 28)
                            .toDouble() /
                        28,
                  ).withValues(alpha: .55),
                ),
              ),
            ),
            if (index != _selectedDeparture!.stops.length - 1)
              Row(
                children: [
                  SizedBox(width: theme.spacing.xMedium - theme.spacing.tiny),
                  const DottedTimeline(),
                  const MediumGap(),
                  Text(
                    '+ ${TimeDateFormatter.formatDuration(_selectedDeparture!.stops[index + 1].duration - _selectedDeparture!.stops[index].duration)}',
                    style: theme.text.body.copyWith(color: theme.colors.hint),
                  ),
                ],
              ),
          ],
        );
      },
    );
  }
}
