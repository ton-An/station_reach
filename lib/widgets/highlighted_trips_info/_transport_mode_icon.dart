part of 'highlighted_trips_info.dart';

class _TransitModeIcon extends StatelessWidget {
  const _TransitModeIcon({required this.mode, required this.backgroundColor});

  final TransitMode mode;
  final Color backgroundColor;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    final IconData icon = _getIcon(mode);

    return Container(
      padding: EdgeInsets.all(theme.spacing.xSmall),
      decoration: BoxDecoration(color: backgroundColor, shape: BoxShape.circle),
      child: Icon(icon, color: theme.colors.background),
    );
  }

  IconData _getIcon(TransitMode mode) {
    switch (mode) {
      case TransitMode.rail:
        return Icons.train;
      default:
        return Icons.question_mark_rounded;
    }
  }
}
