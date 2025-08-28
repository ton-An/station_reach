part of 'map_page.dart';

class _Controls extends StatelessWidget {
  const _Controls();

  @override
  Widget build(BuildContext context) {
    final MapController controller = MapController.of(context);
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return Align(
      alignment: Alignment.bottomRight,
      child: Container(
        padding: EdgeInsets.only(
          bottom: theme.spacing.medium,
          right: theme.spacing.medium,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            PointerInterceptor(
              child: CustomIconButton(
                onPressed: () {
                  controller.animateCamera(
                    zoom: controller.getCamera().zoom + 1,
                    nativeDuration: theme.durations.short,
                  );
                },
                icon: Icons.add_rounded,
                iconColor: theme.colors.accent,
              ),
            ),
            XSmallGap(),
            PointerInterceptor(
              child: CustomIconButton(
                onPressed: () {
                  controller.animateCamera(
                    zoom: controller.getCamera().zoom - 1,
                    nativeDuration: theme.durations.short,
                  );
                },
                icon: Icons.remove_rounded,
                iconColor: theme.colors.error,
              ),
            ),
            XSmallGap(),
            PointerInterceptor(child: _AttributionLegend()),
          ],
        ),
      ),
    );
  }
}
