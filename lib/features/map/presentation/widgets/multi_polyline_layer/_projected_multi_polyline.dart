part of 'multi_polyline_layer.dart';

@immutable
// ignore: invalid_use_of_internal_member
class _ProjectedPolyline<R extends Object> with HitDetectableElement<R> {
  const _ProjectedPolyline._({required this.polyline, required this.points});

  _ProjectedPolyline._fromPolyline(
    Projection projection,
    Polyline<R> polyline,
    bool drawInSingleWorld,
  ) : this._(
        polyline: polyline,
        points: projection.projectList(
          polyline.points,
          projectToSingleWorld: drawInSingleWorld,
        ),
      );
  final Polyline<R> polyline;
  final List<Offset> points;

  @override
  R? get hitValue => polyline.hitValue;
}
