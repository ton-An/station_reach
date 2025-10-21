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
            child: ClipRRect(
              borderRadius: BorderRadius.circular(theme.radii.button),
              child: BackdropFilter(
                filter: theme.misc.blurFilter,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(theme.radii.button),
                    color: theme.colors.background.withValues(alpha: .65),
                    border: Border.all(
                      color: theme.colors.hint.withValues(alpha: .35),
                      strokeAlign: BorderSide.strokeAlignInside,
                      width: 2,
                    ),
                  ),
                  child: const Column(
                    children: [
                      _SearchField(),
                      _SearchResults(),
                      _LoadingShimmer(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
