part of 'map_page.dart';

class _AttributionLegend extends StatelessWidget {
  const _AttributionLegend();

  static const String attributionUrl =
      'https://www.openstreetmap.org/copyright';

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
          child: FadeTapDetector(
            onTap: () {
              launchUrlString(attributionUrl);
            },
            child: Text(
              AppLocalizations.of(context)!.openStreetMapAttribution,
              style: theme.text.subhead.copyWith(
                height: 1,
                color: theme.colors.text.withValues(alpha: .7),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
