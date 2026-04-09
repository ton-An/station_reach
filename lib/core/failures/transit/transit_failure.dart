import 'package:station_reach/core/failures/failure_category_constants.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/// {@template transit_failure}
/// A base failure for transit-related operations.
/// {@endtemplate}
abstract class TransitFailure extends Failure {
  /// {@macro transit_failure}
  const TransitFailure({
    required super.name,
    required super.message,
    required super.code,
  }) : super(categoryCode: FailureCategoryConstants.transit);
}
