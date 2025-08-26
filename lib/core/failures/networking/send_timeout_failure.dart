import 'package:station_reach/core/failures/networking/network_failure.dart';

class SendTimeoutFailure extends NetworkFailure {
  const SendTimeoutFailure()
    : super(
        name: 'Send Timeout',
        message: 'The request to the server took too long to send.',
        code: 'send_timeout',
      );
}
