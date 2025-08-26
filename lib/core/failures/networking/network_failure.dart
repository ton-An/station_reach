import 'package:station_reach/core/failures/failure_category_constants.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class NetworkFailure extends Failure {
  const NetworkFailure({
    required super.name,
    required super.message,
    required super.code,
  }) : super(categoryCode: FailureCategoryConstants.networking);
}
