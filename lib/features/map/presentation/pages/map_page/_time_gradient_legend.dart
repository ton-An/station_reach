part of 'map_page.dart';

/*
  To-Dos:
    - [ ] Maybe add interactivity to the legend? (e.g. highlight stops with certain durations)
*/

class _TimeGradientLegend extends StatelessWidget {
  const _TimeGradientLegend();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return Container(
      padding: EdgeInsets.all(theme.spacing.small + theme.spacing.tiny),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(9),

        color: theme.colors.translucentBackground,
      ),
      child: Container(
        width: 200,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(6),

          gradient: LinearGradient(colors: theme.colors.timelineGradient),
        ),
        child: Padding(
          padding: EdgeInsets.all(theme.spacing.small),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppLocalizations.of(context)!.thirtyMin,
                style: theme.text.subhead.copyWith(
                  color: theme.colors.background,
                ),
              ),
              Text(
                AppLocalizations.of(context)!.fourteenHoursPlus,
                style: theme.text.subhead.copyWith(
                  color: theme.colors.background,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
