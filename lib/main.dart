import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:station_reach/core/dependency_injector.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/features/map/presentation/cubits/departure_selection_cubit/departure_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/station_selection_cubit/station_selection_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_departures_cubit/station_departures_cubit.dart';
import 'package:station_reach/features/map/presentation/pages/map_page/map_page.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/*
  To-Do:
    - [ ] Add docs
    - [ ] Replace launch image
    - [ ] Add licenses of dependencies
*/

/// The entry point of the application.
///
/// It initializes the Flutter bindings, sets up dependency injection,
/// and starts the [MainApp].
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await initGetIt();

  runApp(const MainApp());
}

/// The root widget of the Station Reach application.
///
/// It configures the global theme, localization, and routing for the app.
class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  /// Custom scroll behavior that allows dragging with both touch and mouse devices.
  static final ScrollBehavior _appScrollBehavior =
      const MaterialScrollBehavior().copyWith(
        dragDevices: {PointerDeviceKind.touch, PointerDeviceKind.mouse},
      );

  /// The global router configuration for the application.
  late final GoRouter router;

  /// The cubit responsible for managing in-app notifications.
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
      data: const WebfabrikThemeData(
        colors: WebfabrikColorThemeData(
          primary: Color.fromARGB(255, 83, 196, 108),
          primaryTranslucent: Color.fromARGB(60, 83, 196, 108),
          accent: Color.fromARGB(255, 7, 114, 255),
          // translucentBackground: const Color(0xFFFFFFFF).withValues(alpha: .95),
          timelineGradient: [
            Color.fromARGB(255, 0, 150, 107),
            Color.fromARGB(255, 103, 223, 42),
            Color.fromARGB(255, 255, 245, 67),
            Color.fromARGB(255, 255, 245, 59),
            Color.fromARGB(255, 254, 209, 29),
            Color.fromARGB(255, 255, 152, 0),
            Color.fromARGB(255, 244, 67, 54),
            Color.fromARGB(255, 178, 12, 0),
          ],
        ),
        text: WebfabrikTextThemeData(
          largeTitle: TextStyle(
            fontFamily: 'Inter',
            fontSize: 34,
            fontWeight: FontWeight.w400,
            height: 41 / 34,
            color: CupertinoColors.label,
          ),
          title1: TextStyle(
            fontFamily: 'Inter',
            fontSize: 28,
            fontVariations: [FontVariation('wght', 400)],
            height: 34 / 28,
            color: CupertinoColors.label,
          ),
          title2: TextStyle(
            fontFamily: 'Inter',
            fontSize: 22,
            fontVariations: [FontVariation('wght', 400)],
            height: 28 / 22,
            color: CupertinoColors.label,
          ),
          title3: TextStyle(
            fontFamily: 'Inter',
            fontSize: 20,
            fontVariations: [FontVariation('wght', 400)],
            height: 25 / 20,
            color: CupertinoColors.label,
          ),
          headline: TextStyle(
            fontFamily: 'Inter',
            fontSize: 17,
            fontVariations: [FontVariation('wght', 600)],
            height: 22 / 17,
            color: CupertinoColors.label,
          ),
          body: TextStyle(
            fontFamily: 'Inter',
            fontSize: 18,
            fontVariations: [FontVariation('wght', 400)],
            height: 22 / 17,
            color: CupertinoColors.label,
          ),
          callout: TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            fontVariations: [FontVariation('wght', 400)],
            height: 21 / 16,
            color: CupertinoColors.label,
          ),
          subhead: TextStyle(
            fontFamily: 'Inter',
            fontSize: 15,
            fontVariations: [FontVariation('wght', 400)],
            height: 20 / 15,
            color: CupertinoColors.label,
          ),
          footnote: TextStyle(
            fontFamily: 'Inter',
            fontSize: 13.0,
            fontVariations: [FontVariation('wght', 400)],
            height: 18 / 13,
            color: CupertinoColors.label,
          ),
          caption1: TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            fontVariations: [FontVariation('wght', 400)],
            height: 16 / 12,
            color: CupertinoColors.label,
          ),
          caption2: TextStyle(
            fontFamily: 'Inter',
            fontSize: 11,
            fontVariations: [FontVariation('wght', 400)],
            height: 13 / 11,
            color: CupertinoColors.label,
          ),
        ),
      ),
      child: MultiBlocProvider(
        providers: [BlocProvider(create: (context) => inAppNotificationCubit)],

        child: CupertinoApp.router(
          scrollBehavior: _appScrollBehavior,
          onGenerateTitle: (BuildContext context) =>
              AppLocalizations.of(context)!.appName,
          routerConfig: router,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
            WebfabrikLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en'), // English
          ],
        ),
      ),
    );
  }

  /// Initializes the [GoRouter] with the application's route configuration.
  ///
  /// The router includes a [ShellRoute] for [InAppNotificationListener] and
  /// defines the main [MapPage] route.
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
                  builder: (context, state) => PopScope(
                    /// Keep `/map` on top of the base route so interactive pop (iOS swipe-back)
                    /// cannot reveal the shell used for in-app notification blur.
                    canPop: false,
                    child: MultiBlocProvider(
                      providers: [
                        BlocProvider(
                          create: (context) => inAppNotificationCubit,
                        ),
                        BlocProvider(
                          create: (context) => getIt<StationSearchCubit>(),
                        ),
                        BlocProvider(
                          create: (context) => getIt<StationDeparturesCubit>(),
                        ),
                        BlocProvider(
                          create: (context) => getIt<StationSelectionCubit>(),
                        ),
                        BlocProvider(
                          create: (context) => getIt<DepartureSelectionCubit>(),
                        ),
                      ],
                      child: const MapPage(),
                    ),
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
