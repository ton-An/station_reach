part of 'highlighted_departures_modal.dart';

/// An icon representing the transit mode of a departure.
///
/// It maps [TransitMode] to a specific icon and applies a background color.
class _TransitModeIcon extends StatelessWidget {
  const _TransitModeIcon({required this.mode, required this.backgroundColor});

  final TransitMode mode;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    final IconData icon = _getIcon(mode);

    return Container(
      padding: EdgeInsets.all(theme.spacing.xxSmall),
      decoration: BoxDecoration(color: backgroundColor, shape: BoxShape.circle),
      child: Icon(icon, color: theme.colors.background),
    );
  }

  IconData _getIcon(TransitMode mode) {
    switch (mode) {
      case TransitMode.rail ||
          TransitMode.highspeedRail ||
          TransitMode.longDistance ||
          TransitMode.nightRail ||
          TransitMode.regionalFastRail ||
          TransitMode.suburban ||
          TransitMode.regionalRail:
        return Icons.train;
      case TransitMode.tram:
        return Icons.tram;
      case TransitMode.subway || TransitMode.metro:
        return Icons.subway;
      case TransitMode.bus || TransitMode.coach:
        return Icons.directions_bus;
      case TransitMode.ferry:
        return Icons.directions_boat;
      case TransitMode.funicular:
      default:
        return Icons.question_mark_rounded;
    }
  }
}
