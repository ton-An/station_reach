import 'package:station_reach/core/failures/failure_category_constants.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class TransitFailure extends Failure {
  const TransitFailure({
    required super.name,
    required super.message,
    required super.code,
  }) : super(categoryCode: FailureCategoryConstants.transit);
}
