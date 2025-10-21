part of 'highlighted_departures_modal.dart';

class _AttributionLegend extends StatelessWidget {
  const _AttributionLegend();

  @override
  Widget build(BuildContext context) {
    return AttributionLegend(
      additionalWidgets: const [
        OSSInfo(repositoryUrl: 'https://github.com/ton-An/station_reach'),
      ],
      attributions: [
        Attribution(
          name: AppLocalizations.of(context)!.openStreetMapAttribution,
          url: 'https://www.openstreetmap.org/copyright',
        ),
        Attribution(
          name: AppLocalizations.of(context)!.dataSourcesAttribution,
          url: 'https://transitous.org/sources/',
        ),
        Attribution(
          name: AppLocalizations.of(context)!.transitousAttribution,
          url: 'https://transitous.org/',
        ),
      ],
    );
  }
}
