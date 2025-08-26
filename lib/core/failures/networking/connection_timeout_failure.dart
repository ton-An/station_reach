import 'package:station_reach/core/failures/networking/network_failure.dart';

class ConnectionTimeoutFailure extends NetworkFailure {
  const ConnectionTimeoutFailure()
    : super(
        name: 'Connection Timeout',
        message: 'The connection to the server timed out.',
        code: 'connection_timeout',
      );
}
