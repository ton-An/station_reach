part of 'map_page.dart';

class _Search extends StatelessWidget {
  const _Search();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return Align(
      alignment: Alignment.topCenter,
      child: PointerInterceptor(
        child: Container(
          margin: EdgeInsets.only(top: theme.spacing.xxMedium),
          width: 340,
          child: BlocBuilder<StationSearchCubit, StationSearchState>(
            builder: (context, state) {
              return ClipRRect(
                borderRadius: BorderRadius.circular(theme.radii.button),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: theme.colors.translucentBackground,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 46,
                        child: CupertinoTextField(
                          style: theme.text.body,
                          placeholderStyle: theme.text.body.copyWith(
                            color: theme.colors.text.withValues(alpha: .64),
                          ),
                          placeholder: AppLocalizations.of(
                            context,
                          )!.searchStations,
                          cursorHeight: 20,
                          padding: EdgeInsets.zero,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.zero,
                            color: Colors.transparent,
                          ),
                          cursorColor: theme.colors.primary,
                          onChanged: (String locationQuery) {
                            context.read<StationSearchCubit>().searchStations(
                              locationQuery,
                            );
                          },
                          prefixMode: OverlayVisibilityMode.always,
                          prefix: Padding(
                            padding: EdgeInsets.only(
                              top: theme.spacing.tiny * 1.5,
                              left: theme.spacing.xxSmall,
                              right: theme.spacing.xSmall,
                            ),
                            child: Icon(
                              Icons.search_rounded,
                              color: theme.colors.primary,
                            ),
                          ),
                        ),
                      ),
                      if (state is StationSearchDataState &&
                          state.stations.isNotEmpty) ...[
                        Padding(
                          padding: EdgeInsets.only(left: theme.spacing.xSmall),
                          child: Text(
                            AppLocalizations.of(context)!.results,
                            style: theme.text.subhead.copyWith(
                              fontVariations: [FontVariation('wght', 600)],
                              color: theme.colors.primary.withValues(alpha: .8),
                            ),
                          ),
                        ),
                        SmallGap(),
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxHeight: 200),
                          child: EdgeFade(
                            topOptions: EdgeFadeOptions(enabled: false),
                            bottomOptions: EdgeFadeOptions(
                              heightFactor: .2,
                              halfWayPoint: .7,
                            ),
                            child: ListView.builder(
                              itemCount: state.stations.length,
                              shrinkWrap: true,
                              itemBuilder: (context, index) {
                                return FadeTapDetector(
                                  onTap: () {
                                    context
                                        .read<StationReachabilityCubit>()
                                        .getReachability(
                                          state.stations[index].id,
                                        );
                                  },
                                  child: Padding(
                                    padding: EdgeInsets.only(
                                      left: theme.spacing.xSmall,
                                      bottom: theme.spacing.xSmall,
                                    ),
                                    child: Text(
                                      state.stations[index].name,
                                      style: theme.text.body,
                                    ),
                                  ),
                                );
                              },
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
      ),
    );
  }
}
