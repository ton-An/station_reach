part of 'highlighted_trips_info.dart';

class _TripSelector extends StatelessWidget {
  const _TripSelector({
    required this.trip,
    required this.isSelected,
    required this.onPressed,
    required this.backgroundColor,
  });

  final Departure trip;
  final bool isSelected;
  final VoidCallback onPressed;
  final Color backgroundColor;
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
        child: Row(
          children: [
            _TransitModeIcon(mode: trip.mode, backgroundColor: backgroundColor),
            const SmallGap(),
            Expanded(child: Text(trip.name)),
          ],
        ),
      ),
    );
  }
}
