import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:station_reach/core/dependency_injector.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/cubits/stations_reachability_cubit/station_reachability_cubit.dart';
import 'package:station_reach/pages/map_page/map_page.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  initGetIt();

  runApp(const MainApp());
}

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  late final GoRouter router;
  late final InAppNotificationCubit inAppNotificationCubit;
  @override
  void initState() {
    super.initState();

    inAppNotificationCubit = getIt<InAppNotificationCubit>();

    _initRouter();
  }

  @override
  Widget build(BuildContext context) {
    return WebfabrikTheme(
      data: WebfabrikThemeData(),
      child: MultiBlocProvider(
        providers: [BlocProvider(create: (context) => inAppNotificationCubit)],
        child: CupertinoApp.router(
          onGenerateTitle: (BuildContext context) =>
              AppLocalizations.of(context)!.appName,
          routerConfig: router,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en'), // English
          ],
        ),
      ),
    );
  }

  void _initRouter() {
    router = GoRouter(
      debugLogDiagnostics: true,
      initialLocation: MapPage.route,
      routes: <RouteBase>[
        ShellRoute(
          builder: (context, state, child) =>
              InAppNotificationListener(child: child),
          routes: [
            GoRoute(
              path: '/',

              /// This base route is necessary for the edges of the modal to be blurred
              /// when an [InAppNotification] is shown.
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ColoredBox(color: Colors.white),
              ),
              routes: [
                GoRoute(
                  path: MapPage.pageName,
                  builder: (context, state) => MultiBlocProvider(
                    providers: [
                      BlocProvider(create: (context) => inAppNotificationCubit),
                      BlocProvider(
                        create: (context) => getIt<StationSearchCubit>(),
                      ),
                      BlocProvider(
                        create: (context) => getIt<StationReachabilityCubit>(),
                      ),
                    ],
                    child: const MapPage(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
