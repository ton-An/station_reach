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

    final List<Color> timelineGradient = theme.colors.timelineGradient
        .map((color) => color.withValues(alpha: .85))
        .toList();

    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(theme.radii.small),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
            child: Container(
              padding: EdgeInsets.all(theme.spacing.small + 1),
              color: theme.colors.translucentBackground,

              child: Container(
                width: 250,
                height: 36,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(theme.radii.small * .7),
                  gradient: LinearGradient(colors: timelineGradient),
                ),
              ),
            ),
          ),
        ),
        Positioned.fill(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: theme.spacing.xSmall + theme.spacing.xTiny,
            ),
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
      ],
    );
  }
}
