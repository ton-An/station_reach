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

    final Widget icon = IconHelper.getTransitModeIcon(
      mode: mode,
      size: 20,
      color: theme.colors.background,
    );

    return Container(
      padding: EdgeInsets.all(theme.spacing.xxSmall),
      decoration: BoxDecoration(color: backgroundColor, shape: BoxShape.circle),
      child: icon,
    );
  }
}
