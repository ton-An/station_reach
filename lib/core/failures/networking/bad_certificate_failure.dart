import 'package:station_reach/core/failures/networking/network_failure.dart';

class BadCertificateFailure extends NetworkFailure {
  const BadCertificateFailure()
    : super(
        name: 'Certificate Error',
        message: "The server's SSL certificate is invalid.",
        code: 'bad_certificate',
      );
}
