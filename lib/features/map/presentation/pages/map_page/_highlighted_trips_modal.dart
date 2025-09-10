part of 'map_page.dart';

class _HighlightedTripsModal extends StatelessWidget {
  const _HighlightedTripsModal();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StationReachabilityCubit, StationReachabilityState>(
      builder: (context, state) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: WebfabrikModal(
            title: 'Trips',
            secondaryButtons: const [],
            legend: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const _TimeGradientLegend(),
                AttributionLegend(
                  attributions: [
                    Attribution(
                      name: AppLocalizations.of(context)!.mapLibreAttribution,
                      url: 'https://maplibre.org/',
                    ),
                    Attribution(
                      name: AppLocalizations.of(context)!.mapTilerAttribution,
                      url: 'https://www.maptiler.com/',
                    ),
                    Attribution(
                      name: AppLocalizations.of(
                        context,
                      )!.openStreetMapAttribution,
                      url: 'https://www.openstreetmap.org/copyright',
                    ),
                    Attribution(
                      name: AppLocalizations.of(
                        context,
                      )!.dataSourcesAttribution,
                      url: 'https://transitous.org/sources/',
                    ),
                    Attribution(
                      name: AppLocalizations.of(context)!.transitousAttribution,
                      url: 'https://transitous.org/',
                    ),
                  ],
                ),
              ],
            ),
            builder: (context, scrollController) =>
                state is StationReachabilityStateSuccess
                ? ListView.builder(
                    controller: scrollController,
                    itemCount: state.trips.length,
                    itemBuilder: (context, index) =>
                        Text(state.trips[index].name),
                  )
                : ListView(
                    controller: scrollController,
                    children: const [Text('No trips')],
                  ),
          ),
        );
      },
    );
  }
}
