part of 'map_page.dart';

class _SearchField extends StatelessWidget {
  const _SearchField();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return SizedBox(
      height: 54,
      child: CupertinoTextField(
        style: theme.text.body.copyWith(height: 1.27, color: theme.colors.text),
        placeholderStyle: theme.text.body.copyWith(
          color: theme.colors.text.withValues(alpha: .64),
        ),
        placeholder: AppLocalizations.of(context)!.searchStations,
        cursorHeight: 20,
        padding: EdgeInsets.zero,
        decoration: const BoxDecoration(
          borderRadius: BorderRadius.zero,
          color: Colors.transparent,
        ),
        cursorColor: theme.colors.primary,
        autocorrect: false,

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
            color: theme.colors.hint.withValues(alpha: .45),
          ),
        ),
        onChanged: (String locationQuery) =>
            context.read<StationSearchCubit>().searchStations(locationQuery),
      ),
    );
  }
}
