part of 'highlighted_trips_info.dart';

class _TripSelector extends StatelessWidget {
  const _TripSelector({
    required this.trips,
    required this.isSelected,
    required this.onPressed,
  });

  final List<Trip> trips;
  final bool isSelected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: EdgeInsets.all(theme.spacing.xSmall),
        decoration: BoxDecoration(
          color: isSelected
              ? theme.colors.primary
              : theme.colors.translucentBackground,
          borderRadius: BorderRadius.circular(theme.radii.small),
        ),
        child: Text(trips.first.name),
      ),
    );
  }
}
