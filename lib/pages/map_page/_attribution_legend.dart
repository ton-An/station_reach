part of 'map_page.dart';

class _AttributionLegend extends StatelessWidget {
  const _AttributionLegend();

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
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _AttributionLink(
                text: AppLocalizations.of(context)!.openStreetMapAttribution,
                url: 'https://www.openstreetmap.org/copyright',
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: theme.spacing.xSmall),
                child: const Dot(),
              ),
              _AttributionLink(
                text: AppLocalizations.of(context)!.mapTilerAttribution,
                url: 'https://www.maptiler.com/',
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: theme.spacing.xSmall),
                child: const Dot(),
              ),
              _AttributionLink(
                text: AppLocalizations.of(context)!.mapLibreAttribution,
                url: 'https://maplibre.org/',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AttributionLink extends StatelessWidget {
  const _AttributionLink({required this.text, required this.url});

  final String text;
  final String url;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return FadeGestureDetector(
      onTap: () {
        launchUrlString(url);
      },
      child: Text(
        text,
        style: theme.text.subhead.copyWith(
          height: 1,
          color: theme.colors.text.withValues(alpha: .7),
        ),
      ),
    );
  }
}
