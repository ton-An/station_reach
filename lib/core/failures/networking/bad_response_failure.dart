import 'package:station_reach/core/failures/networking/network_failure.dart';

class BadResponseFailure extends NetworkFailure {
  const BadResponseFailure()
    : super(
        name: 'Invalid Response',
        message: 'The server returned an invalid response.',
        code: 'bad_response',
      );
}
