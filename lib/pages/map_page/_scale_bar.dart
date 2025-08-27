part of 'map_page.dart';

class _ScaleBar extends StatelessWidget {
  const _ScaleBar();

  @override
  Widget build(BuildContext context) {
    final MapController controller = MapController.of(context);
    final MapCamera camera = MapCamera.of(context);

    final double latitude = camera.center.lat.toDouble();
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    final metersPerPixel = controller.getMetersPerPixelAtLatitudeSync(latitude);

    final BorderSide borderSide = BorderSide(
      color: theme.colors.text,
      width: 1,
    );

    final unit = metersPerPixel >= 10 ? _Unit.km : _Unit.m;

    final meters = getMeters(metersPerPixel);

    return Align(
      alignment: Alignment.bottomLeft,
      child: Container(
        margin: EdgeInsets.only(
          bottom: theme.spacing.medium,
          left: theme.spacing.medium,
        ),
        padding: EdgeInsets.symmetric(
          horizontal: theme.spacing.xSmall,
          vertical: theme.spacing.xSmall,
        ),
        decoration: BoxDecoration(
          color: theme.colors.translucentBackground,
          borderRadius: BorderRadius.circular(theme.radii.small),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${(meters / unit.meters).toInt()} ${unit.abbreviation}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.text.subhead.copyWith(color: theme.colors.text),
            ),
            Container(
              width: meters / metersPerPixel,
              height: 3,
              padding: EdgeInsets.only(
                left: theme.spacing.tiny + theme.spacing.xTiny,
              ),
              decoration: BoxDecoration(
                color: theme.colors.text,
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ],
        ),
      ),
    );
  }

  double getMeters(double metersPerPixel) => switch (metersPerPixel) {
    >= 300000 => 50000000,
    >= 200000 => 30000000,
    >= 100000 => 20000000,
    >= 75000 => 10000000,
    >= 50000 => 5000000,
    >= 30000 => 3000000,
    >= 15000 => 2000000,
    >= 10000 => 1000000,
    >= 5000 => 500000,
    >= 3000 => 300000,
    >= 2000 => 200000,
    >= 1000 => 100000,
    >= 500 => 50000,
    >= 300 => 30000,
    >= 200 => 20000,
    >= 100 => 10000,
    >= 50 => 5000,
    >= 30 => 3000,
    >= 20 => 2000,
    >= 10 => 1000,
    >= 5 => 500,
    >= 3 => 300,
    >= 2 => 200,
    >= 1 => 100,
    >= 0.5 => 50,
    >= 0.3 => 30,
    >= 0.2 => 20,
    >= 0.1 => 10,
    >= 0.05 => 5,
    >= 0.03 => 3,
    >= 0.02 => 2,
    >= 0.01 => 1,
    _ => metersPerPixel * 100,
  };
}

enum _Unit {
  km(1000, 'km'),
  m(1, 'm');

  const _Unit(this.meters, this.abbreviation);

  final int meters;
  final String abbreviation;
}
