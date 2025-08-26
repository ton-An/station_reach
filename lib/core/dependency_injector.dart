import 'package:get_it/get_it.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

final GetIt getIt = GetIt.instance;

void initGetIt() {
  registerInAppNotificationDependencies();
}

void registerInAppNotificationDependencies() {
  // -- Presentation -- //
  getIt.registerFactory(() => InAppNotificationCubit());
}
