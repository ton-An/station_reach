import 'package:station_reach/core/failures/networking/network_failure.dart';

class StatusCodeNotOkFailure extends NetworkFailure {
  const StatusCodeNotOkFailure({required int statusCode})
    : super(
        name: 'Status Code Not OK',
        message: 'The returned status code from the server is $statusCode',
        code: 'status_code_not_ok',
      );
}
