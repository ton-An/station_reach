part of 'map_page.dart';

class _TripInfo extends StatelessWidget {
  const _TripInfo({required this.trip});

  final Trip trip;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return PointerInterceptor(
      child: Padding(
        padding: EdgeInsets.all(theme.spacing.medium),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(theme.radii.small),
          child: Container(
            width: 300,
            color: theme.colors.translucentBackground,
            padding: EdgeInsets.all(theme.spacing.medium),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  child: Text(
                    trip.name,
                    style: theme.text.headline.copyWith(
                      color: theme.colors.text,
                    ),
                  ),
                ),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 200),
                  child: ListView.builder(
                    itemCount: trip.stops.length,
                    itemBuilder: (context, index) =>
                        Text(trip.stops[index].name),
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
