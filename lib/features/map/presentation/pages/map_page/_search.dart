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
            child: BlocBuilder<StationSearchCubit, StationSearchState>(
              builder: (context, state) {
                return ClipRRect(
                  borderRadius: BorderRadius.circular(theme.radii.button),
                  child: BackdropFilter(
                    filter: theme.misc.blurFilter,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: theme.colors.background.withValues(alpha: .65),
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
                              ),
                            ),
                          ),
                          if (state is StationSearchDataState &&
                              state.stations.isNotEmpty) ...[
                            Padding(
                              padding: EdgeInsets.only(
                                left: theme.spacing.xSmall,
                              ),
                              child: Text(
                                AppLocalizations.of(context)!.results,
                                style: theme.text.subhead.copyWith(
                                  fontVariations: [
                                    const FontVariation('wght', 600),
                                  ],
                                  color: theme.colors.primary.withValues(
                                    alpha: .8,
                                  ),
                                ),
                              ),
                            ),
                            ConstrainedBox(
                              constraints: const BoxConstraints(maxHeight: 260),
                              child: ListView.builder(
                                itemCount: state.stations.length,
                                shrinkWrap: true,
                                itemBuilder: (context, index) {
                                  return FadeGestureDetector(
                                    onTap: () {
                                      context
                                          .read<StationReachabilityCubit>()
                                          .getReachability(
                                            state.stations[index],
                                          );
                                      context
                                          .read<StationSearchCubit>()
                                          .collapseSearch();
                                    },
                                    minOpacity: index.isEven ? .1 : .6,
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: index.isEven
                                            ? theme.colors.translucentBackground
                                            : theme.colors.primaryTranslucent,
                                      ),
                                      child: Padding(
                                        padding: EdgeInsets.only(
                                          top: theme.spacing.xSmall,
                                          left: theme.spacing.xSmall,
                                          bottom: theme.spacing.xSmall,
                                        ),
                                        child: Text(
                                          state.stations[index].name,
                                          style: theme.text.body,
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
