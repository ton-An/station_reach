part of 'map_page.dart';

class _TimeGradientLegend extends StatelessWidget {
  const _TimeGradientLegend();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return _LegendContainer(
      child: Container(
        height: 10,
        width: 100,
        margin: EdgeInsets.all(theme.spacing.xTiny),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(3.3),
          gradient: LinearGradient(colors: theme.colors.timelineGradient),
        ),
      ),
    );
  }
}
