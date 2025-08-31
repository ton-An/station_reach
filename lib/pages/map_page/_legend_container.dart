part of 'map_page.dart';

class _LegendContainer extends StatelessWidget {
  const _LegendContainer({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return ClipRRect(
      borderRadius: BorderRadius.circular(theme.radii.small),
      child: BackdropFilter(
        filter: theme.misc.blurFilter,
        child: Container(
          padding: EdgeInsets.all(theme.spacing.xxSmall),
          color: theme.colors.translucentBackground,
          child: child,
        ),
      ),
    );
  }
}
