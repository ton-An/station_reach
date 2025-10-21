part of 'highlighted_departures_modal.dart';

class _DeparturesList extends StatelessWidget {
  const _DeparturesList({required this.scrollController});

  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return BlocBuilder<StationSelectionCubit, StationSelectionState>(
      builder: (context, state) {
        if (state is StationSelectedState) {
          return ListView.builder(
            controller: scrollController,
            itemCount: state.departures.length,
            padding: EdgeInsets.all(theme.spacing.medium),
            itemBuilder: (context, index) => _DepartureListItem(
              departure: state.departures[index],
              duration: state.departures[index].stops.last.duration,
              iconBackgroundColor: ColorHelper.interpolateColors(
                WebfabrikTheme.of(context).colors.secondaryGradient,
                index / max(state.departures.length - 1, 1),
              ),
              onPressed: () {
                context.read<DepartureSelectionCubit>().selectDeparture(
                  state.departures[index],
                );
              },
              showDivider: index != state.departures.length - 1,
            ),
          );
        }

        return ListView(
          controller: scrollController,
          padding: EdgeInsets.only(top: theme.spacing.xMedium),
          children: [
            Text(
              textAlign: TextAlign.center,
              AppLocalizations.of(context)!.noStationSelected,
              style: theme.text.body.copyWith(color: theme.colors.hint),
            ),
          ],
        );
      },
    );
  }
}
