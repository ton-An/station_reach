part of 'map_page.dart';

class _SearchResults extends StatelessWidget {
  const _SearchResults();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return BlocBuilder<StationSearchCubit, StationSearchState>(
      builder: (context, stationSearchState) {
        return AnimatedContainer(
          duration: theme.durations.tiny,
          constraints: BoxConstraints(
            maxHeight: stationSearchState is StationSearchDataState ? 250 : 0,
          ),
          child: AnimatedSize(
            duration: theme.durations.xTiny,
            curve: Curves.easeOut,
            child: ListView.builder(
              itemCount: stationSearchState is StationSearchDataState
                  ? stationSearchState.stations.length
                  : 0,
              shrinkWrap: true,
              itemBuilder: (context, index) {
                String? area;

                if (stationSearchState is StationSearchDataState) {
                  final String? stationArea =
                      stationSearchState.stations[index].area;
                  final String? countryCode =
                      stationSearchState.stations[index].countryCode;

                  if (stationArea != null && countryCode != null) {
                    area = '$countryCode, $stationArea';
                  } else if (stationArea != null) {
                    area = stationArea;
                  } else if (countryCode != null) {
                    area = countryCode;
                  }
                }

                return FadeGestureDetector(
                  onTap: () {
                    context.read<StationDeparturesCubit>().getReachability(
                      stationSearchState.stations[index],
                    );
                    context.read<StationSearchCubit>().collapseSearch();

                    FocusManager.instance.primaryFocus?.unfocus();
                  },
                  minOpacity: index.isEven ? .1 : .6,
                  child: Padding(
                    padding: EdgeInsets.only(
                      top: theme.spacing.xSmall,
                      left: theme.spacing.xSmall,
                      bottom: theme.spacing.xSmall,
                    ),
                    child: Row(
                      children: [
                        Text(
                          (stationSearchState as StationSearchDataState)
                              .stations[index]
                              .name,
                          style: theme.text.body,
                        ),
                        if (area != null) ...[
                          const XSmallGap(),
                          const Dot(),
                          const XSmallGap(),
                          Expanded(
                            child: Text(
                              area,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.text.body.copyWith(
                                color: theme.colors.hint,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }
}
