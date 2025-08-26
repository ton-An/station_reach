import 'package:station_reach/core/failures/networking/network_failure.dart';

class ReceiveTimeoutFailure extends NetworkFailure {
  const ReceiveTimeoutFailure()
    : super(
        name: 'Receive Timeout',
        message: 'The server took too long to send data.',
        code: 'receive_timeout',
      );
}
