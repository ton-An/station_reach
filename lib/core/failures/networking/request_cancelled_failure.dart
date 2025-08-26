import 'package:station_reach/core/failures/networking/network_failure.dart';

class RequestCancelledFailure extends NetworkFailure {
  const RequestCancelledFailure()
    : super(
        name: 'Request Cancelled',
        message: 'The network request to the server was cancelled.',
        code: 'request_cancelled',
      );
}
