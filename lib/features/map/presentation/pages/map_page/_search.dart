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
                            borderRadius: BorderRadius.circular(
                              theme.radii.button,
                            ),
                            color: theme.colors.background.withValues(
                              alpha: .65,
                            ),
                            border: Border.all(
                              color: theme.colors.hint.withValues(alpha: .35),
                              strokeAlign: BorderSide.strokeAlignInside,
                              width: 2,
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
                                    autocorrect: false,
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
                                        color: theme.colors.hint.withValues(
                                          alpha: .45,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                              AnimatedContainer(
                                duration: theme.durations.tiny,
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
                                      String? area;

                                      if (stationSearchState
                                          is StationSearchDataState) {
                                        final String? stationArea =
                                            stationSearchState
                                                .stations[index]
                                                .area;
                                        final String? countryCode =
                                            stationSearchState
                                                .stations[index]
                                                .countryCode;

                                        if (stationArea != null &&
                                            countryCode != null) {
                                          area = '$stationArea, $countryCode';
                                        } else if (stationArea != null) {
                                          area = stationArea;
                                        } else if (countryCode != null) {
                                          area = countryCode;
                                        }
                                      }

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
                                          FocusManager.instance.primaryFocus
                                              ?.unfocus();
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
                                                (stationSearchState
                                                        as StationSearchDataState)
                                                    .stations[index]
                                                    .name,
                                                style: theme.text.body,
                                              ),
                                              if (area != null) ...[
                                                const XSmallGap(),
                                                const Dot(),
                                                const XSmallGap(),
                                                Text(
                                                  area,
                                                  style: theme.text.body
                                                      .copyWith(
                                                        color:
                                                            theme.colors.hint,
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
                              ),

                              AnimatedSize(
                                duration: theme.durations.xTiny,
                                child:
                                    stationSearchState
                                            is StationSearchStateLoading ||
                                        stationReachabilityState
                                            is StationReachabilityStateLoading
                                    ? Shimmer(
                                        colorOpacity: .5,
                                        duration: theme.durations.xHuge,
                                        child: Container(
                                          height: 8,
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            color:
                                                theme.colors.primaryTranslucent,
                                          ),
                                        ),
                                      )
                                    : const SizedBox.shrink(),
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
