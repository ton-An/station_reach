part of 'map_page.dart';

class _Search extends StatelessWidget {
  const _Search();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return Align(
      alignment: Alignment.topCenter,
      child: PointerInterceptor(
        child: SafeArea(
          child: Container(
            margin: EdgeInsets.only(
              top: theme.spacing.medium,
              left: theme.spacing.medium,
              right: theme.spacing.medium,
            ),
            child: BlocBuilder<StationReachabilityCubit, StationReachabilityState>(
              builder: (context, stationReachabilityState) {
                return BlocBuilder<StationSearchCubit, StationSearchState>(
                  builder: (context, stationSearchState) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(theme.radii.button),
                      child: BackdropFilter(
                        filter: theme.misc.blurFilter,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            color: theme.colors.background.withValues(
                              alpha: .65,
                            ),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              MouseRegion(
                                cursor: SystemMouseCursors.text,
                                child: SizedBox(
                                  height: 54,
                                  child: CupertinoTextField(
                                    style: theme.text.body.copyWith(
                                      height: 1.27,
                                      color: theme.colors.text,
                                    ),
                                    placeholderStyle: theme.text.body.copyWith(
                                      color: theme.colors.text.withValues(
                                        alpha: .64,
                                      ),
                                    ),
                                    placeholder: AppLocalizations.of(
                                      context,
                                    )!.searchStations,
                                    cursorHeight: 20,
                                    padding: EdgeInsets.zero,
                                    decoration: const BoxDecoration(
                                      borderRadius: BorderRadius.zero,
                                      color: Colors.transparent,
                                    ),
                                    cursorColor: theme.colors.primary,
                                    onChanged: (String locationQuery) {
                                      context
                                          .read<StationSearchCubit>()
                                          .searchStations(locationQuery);
                                    },
                                    prefixMode: OverlayVisibilityMode.always,
                                    prefix: Padding(
                                      padding: EdgeInsets.only(
                                        top: theme.spacing.tiny * 1.5,
                                        left: theme.spacing.medium,
                                        right: theme.spacing.xSmall,
                                      ),
                                      child: Icon(
                                        Icons.search_rounded,
                                        size: 28,
                                        color: theme.colors.primary,
                                      ),
                                    ),
                                    suffix: AnimatedOpacity(
                                      opacity:
                                          stationSearchState
                                                  is StationSearchStateLoading ||
                                              stationReachabilityState
                                                  is StationReachabilityStateLoading
                                          ? 1
                                          : 0,
                                      duration: theme.durations.xTiny,
                                      child: Padding(
                                        padding: EdgeInsets.only(
                                          right: theme.spacing.medium,
                                        ),
                                        child: LoadingIndicator(
                                          color: theme
                                              .colors
                                              .translucentBackgroundContrast,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              AnimatedContainer(
                                duration: theme.durations.xTiny,
                                constraints: BoxConstraints(
                                  maxHeight:
                                      stationSearchState
                                          is StationSearchDataState
                                      ? 250
                                      : 0,
                                ),
                                child: AnimatedSize(
                                  duration: theme.durations.xTiny,
                                  curve: Curves.easeOut,
                                  child: ListView.builder(
                                    itemCount:
                                        stationSearchState
                                            is StationSearchDataState
                                        ? stationSearchState.stations.length
                                        : 0,
                                    shrinkWrap: true,
                                    itemBuilder: (context, index) {
                                      return FadeGestureDetector(
                                        onTap: () {
                                          context
                                              .read<StationReachabilityCubit>()
                                              .getReachability(
                                                stationSearchState
                                                    .stations[index],
                                              );
                                          context
                                              .read<StationSearchCubit>()
                                              .collapseSearch();
                                        },
                                        minOpacity: index.isEven ? .1 : .6,
                                        child: Padding(
                                          padding: EdgeInsets.only(
                                            top: theme.spacing.xSmall,
                                            left: theme.spacing.xSmall,
                                            bottom: theme.spacing.xSmall,
                                          ),
                                          child: Text(
                                            (stationSearchState
                                                    as StationSearchDataState)
                                                .stations[index]
                                                .name,
                                            style: theme.text.body,
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ),
                            ],
                            // ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
