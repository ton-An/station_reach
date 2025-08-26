import 'package:station_reach/core/failures/networking/network_failure.dart';

class ConnectionFailure extends NetworkFailure {
  const ConnectionFailure()
    : super(
        name: 'Connection Failure',
        message: 'Failed to establish a connection with the server.',
        code: 'connection_failure',
      );
}
