part of 'highlighted_departures_modal.dart';

class _DepartureListItem extends StatelessWidget {
  const _DepartureListItem({
    required this.departure,
    required this.onPressed,
    required this.iconBackgroundColor,
    required this.duration,
    this.showDivider = true,
  });

  final Departure departure;
  final VoidCallback onPressed;
  final Color iconBackgroundColor;
  final Duration duration;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return FadeTapDetector(
      onTap: onPressed,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.symmetric(vertical: theme.spacing.xSmall),
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: theme.spacing.xSmall),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _TransitModeIcon(
                    mode: departure.mode,
                    backgroundColor: iconBackgroundColor.withValues(alpha: .40),
                  ),

                  const XXSmallGap(),

                  Text(departure.name, style: theme.text.body.copyWith()),

                  const XSmallGap(),
                  const Dot(),
                  const XSmallGap(),

                  Expanded(
                    child: Text(
                      TimeDateFormatter.formatDuration(duration),
                      style: theme.text.body.copyWith(
                        color: ColorHelper.interpolateColors(
                          WebfabrikTheme.of(context).colors.timelineGradient,
                          (duration.inMinutes ~/ 30).clamp(0, 28) / 28,
                        ),
                      ),
                    ),
                  ),

                  SmallIconButton(
                    icon: CupertinoIcons.forward,
                    onPressed: onPressed,
                    backgroundColor: Colors.transparent,
                    alignmentOffset: const Offset(1, 0),
                  ),
                ],
              ),
            ),
          ),

          if (showDivider)
            Container(
              height: 1,
              color: theme.colors.translucentBackgroundContrast,
            ),
        ],
      ),
    );
  }
}
