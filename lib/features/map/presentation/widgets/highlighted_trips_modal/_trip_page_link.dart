part of 'highlighted_trips_modal.dart';

class _TripPageLink extends StatelessWidget {
  const _TripPageLink({
    required this.tripName,
    required this.mode,
    required this.onPressed,
    this.showDivider = true,
    required this.iconBackgroundColor,
    required this.duration,
  });

  final String tripName;
  final TransitMode mode;
  final VoidCallback onPressed;
  final bool showDivider;
  final Color iconBackgroundColor;
  final Duration duration;

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
                    mode: mode,
                    backgroundColor: iconBackgroundColor.withValues(alpha: .40),
                  ),
                  const XXSmallGap(),
                  Text(tripName, style: theme.text.body.copyWith()),

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
