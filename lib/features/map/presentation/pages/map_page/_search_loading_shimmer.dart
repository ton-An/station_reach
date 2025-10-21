part of 'map_page.dart';

class _LoadingShimmer extends StatelessWidget {
  const _LoadingShimmer();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return BlocBuilder<StationSearchCubit, StationSearchState>(
      builder: (context, stationSearchState) {
        return BlocBuilder<StationReachabilityCubit, StationReachabilityState>(
          builder: (context, stationReachabilityState) {
            return AnimatedSize(
              duration: theme.durations.xTiny,
              child:
                  stationSearchState is StationSearchStateLoading ||
                      stationReachabilityState
                          is StationReachabilityStateLoading
                  ? Shimmer(
                      colorOpacity: .5,
                      duration: theme.durations.xHuge,
                      child: Container(
                        height: 8,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: theme.colors.primaryTranslucent,
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
            );
          },
        );
      },
    );
  }
}
