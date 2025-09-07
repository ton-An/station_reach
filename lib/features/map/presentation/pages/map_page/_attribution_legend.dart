part of 'map_page.dart';

class _AttributionLegend extends StatefulWidget {
  const _AttributionLegend();

  @override
  State<_AttributionLegend> createState() => _AttributionLegendState();
}

class _AttributionLegendState extends State<_AttributionLegend> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return Padding(
      padding: EdgeInsets.only(left: theme.spacing.xxSmall),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(theme.radii.small),
        child: BackdropFilter(
          filter: theme.misc.blurFilter,
          child: Container(
            color: theme.colors.translucentBackground,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              reverse: true,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (_expanded)
                    Padding(
                      padding: EdgeInsets.only(left: theme.spacing.xxSmall),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          _AttributionLink(
                            text: AppLocalizations.of(
                              context,
                            )!.openStreetMapAttribution,
                            url: 'https://www.openstreetmap.org/copyright',
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: theme.spacing.xSmall,
                            ),
                            child: const Dot(),
                          ),
                          _AttributionLink(
                            text: AppLocalizations.of(
                              context,
                            )!.mapTilerAttribution,
                            url: 'https://www.maptiler.com/',
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: theme.spacing.xSmall,
                            ),
                            child: const Dot(),
                          ),
                          _AttributionLink(
                            text: AppLocalizations.of(
                              context,
                            )!.mapLibreAttribution,
                            url: 'https://maplibre.org/',
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: theme.spacing.xSmall,
                            ),
                            child: const Dot(),
                          ),
                          _AttributionLink(
                            text: AppLocalizations.of(
                              context,
                            )!.dataSourcesAttribution,
                            url: 'https://transitous.org/sources/',
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: theme.spacing.xSmall,
                            ),
                            child: const Dot(),
                          ),
                          _AttributionLink(
                            text: AppLocalizations.of(
                              context,
                            )!.transitousAttribution,
                            url: 'https://transitous.org/',
                          ),
                        ],
                      ),
                    ),

                  GestureDetector(
                    behavior: HitTestBehavior.translucent,
                    onTap: () {
                      setState(() {
                        _expanded = !_expanded;
                      });
                    },
                    child: Padding(
                      padding: EdgeInsets.all(theme.spacing.xxSmall),
                      child: Icon(
                        _expanded ? Icons.close_rounded : Icons.info_rounded,
                        color: theme.colors.hint,
                      ),
                    ),
                  ),
                ],
              ),
            ),
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
