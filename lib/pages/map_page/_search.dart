part of 'map_page.dart';

class _Search extends StatelessWidget {
  const _Search();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return Align(
      alignment: Alignment.topCenter,
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
                  children: [
                    SizedBox(
                      height: 46,
                      child: CupertinoTextField(
                        style: theme.text.body,
                        placeholderStyle: theme.text.body.copyWith(
                          color: theme.colors.text.withValues(alpha: .64),
                        ),
                        placeholder: 'Search Stations',
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
                            left: theme.spacing.xxSmall,
                            right: theme.spacing.xSmall,
                          ),
                          child: Icon(
                            Icons.search,
                            color: theme.colors.primary,
                          ),
                        ),
                      ),
                    ),
                    if (state is StationSearchStateSuccess &&
                        state.stations.isNotEmpty)
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxHeight: 200),
                        child: ListView.builder(
                          itemCount: state.stations.length,
                          shrinkWrap: true,
                          itemBuilder: (context, index) {
                            return FadeTapDetector(
                              onTap: () {
                                context
                                    .read<StationReachabilityCubit>()
                                    .getReachability(state.stations[index].id);
                              },
                              child: Padding(
                                padding: EdgeInsets.symmetric(
                                  horizontal: theme.spacing.xSmall,
                                  vertical: theme.spacing.xSmall,
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
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
