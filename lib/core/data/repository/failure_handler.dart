import 'package:dio/dio.dart';
import 'package:station_reach/core/failures/networking/bad_certificate_failure.dart';
import 'package:station_reach/core/failures/networking/bad_response_failure.dart';
import 'package:station_reach/core/failures/networking/connection_failure.dart';
import 'package:station_reach/core/failures/networking/connection_timeout_failure.dart';
import 'package:station_reach/core/failures/networking/receive_timeout_failure.dart';
import 'package:station_reach/core/failures/networking/request_cancelled_failure.dart';
import 'package:station_reach/core/failures/networking/send_timeout_failure.dart';
import 'package:station_reach/core/failures/networking/unknown_request_failure.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

abstract class FailureHandler {
  /// {@macro repository_failure_handler}
  const FailureHandler();

  /// Maps [DioException]s to [Failure]s
  ///
  /// Parameters:
  /// - [DioException]: exception
  /// - [ServerType]: type of the server the request was sent to
  ///
  /// Returns:
  /// {@template converted_dio_exceptions}
  /// - [ConnectionTimeoutFailure]
  /// - [SendTimeoutFailure]
  /// - [ReceiveTimeoutFailure]
  /// - [BadCertificateFailure]
  /// - [BadResponseFailure]
  /// - [RequestCancelledFailure]
  /// - [ConnectionFailure]
  /// - [UnknownRequestFailure]
  /// {@endtemplate}
  Failure dioExceptionMapper({required DioException dioException});
}

class FailureHandlerImpl extends FailureHandler {
  @override
  Failure dioExceptionMapper({required DioException dioException}) {
    switch (dioException.type) {
      case DioExceptionType.connectionTimeout:
        return const ConnectionTimeoutFailure();
      case DioExceptionType.sendTimeout:
        return const SendTimeoutFailure();
      case DioExceptionType.receiveTimeout:
        return const ReceiveTimeoutFailure();
      case DioExceptionType.badCertificate:
        return const BadCertificateFailure();
      case DioExceptionType.badResponse:
        return const BadResponseFailure();
      case DioExceptionType.cancel:
        return const RequestCancelledFailure();
      case DioExceptionType.connectionError:
        return const ConnectionFailure();
      case DioExceptionType.unknown:
        return const UnknownRequestFailure();
    }
  }
}
