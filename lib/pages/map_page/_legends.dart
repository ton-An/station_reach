part of 'map_page.dart';

class _Legends extends StatelessWidget {
  const _Legends();

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return Align(
      alignment: Alignment.bottomLeft,
      child: Padding(
        padding: EdgeInsets.only(
          bottom: theme.spacing.medium,
          left: theme.spacing.medium,
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [_ScaleBar(), XSmallGap(), _TimeGradientLegend()],
        ),
      ),
    );
  }
}
