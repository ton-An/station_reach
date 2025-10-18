part of 'highlighted_trips_modal.dart';

class _SingleTripItinerary extends StatelessWidget {
  const _SingleTripItinerary({
    required this.trip,
    required this.scrollController,
  });

  final Trip? trip;
  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return ListView.builder(
      controller: scrollController,
      itemCount: trip!.stops.length,
      padding: EdgeInsets.all(theme.spacing.medium),
      itemBuilder: (context, index) {
        return Column(
          children: [
            WebfabrikListItem(
              title: trip!.stops[index].name,
              subtitle: TimeDateFormatter.formatDuration(
                trip!.stops[index].duration,
              ),
              icon: WebfabrikListIcon(
                iconData: WebfabrikIconData(
                  icon: Icons.location_on,
                  color: ColorHelper.interpolateColors(
                    theme.colors.timelineGradient,
                    (trip!.stops[index].duration.inMinutes ~/ 30)
                            .clamp(0, 28)
                            .toDouble() /
                        28,
                  ).withValues(alpha: .55),
                ),
              ),
            ),
            if (index != trip!.stops.length - 1)
              Row(
                children: [
                  SizedBox(width: theme.spacing.xMedium - theme.spacing.tiny),
                  const DottedTimeline(),
                  const MediumGap(),
                  Text(
                    '+ ${TimeDateFormatter.formatDuration(trip!.stops[index + 1].duration - trip!.stops[index].duration)}',
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
