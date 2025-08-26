import 'package:station_reach/core/failures/networking/network_failure.dart';

class UnknownRequestFailure extends NetworkFailure {
  const UnknownRequestFailure()
    : super(
        name: 'Unknown Request Failure',
        message: 'The request to the server failed for an unknown reason',
        code: 'unknown_request_failure',
      );
}
