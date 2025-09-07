import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:station_reach/core/dependency_injector.dart';
import 'package:station_reach/core/l10n/app_localizations.dart';
import 'package:station_reach/features/map/presentation/cubits/station_search_cubit/station_search_cubit.dart';
import 'package:station_reach/features/map/presentation/cubits/stations_reachability_cubit/station_reachability_cubit.dart';
import 'package:station_reach/features/map/presentation/pages/map_page/map_page.dart';
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
      data: WebfabrikThemeData(
        colors: WebfabrikColorThemeData(
          primary: const Color.fromARGB(255, 83, 196, 108),
          primaryTranslucent: const Color.fromARGB(60, 83, 196, 108),
          accent: const Color.fromARGB(255, 7, 114, 255),
          translucentBackground: const Color(0xFFFFFFFF).withValues(alpha: .95),
          timelineGradient: [
            const Color.fromARGB(255, 0, 150, 136),
            const Color.fromARGB(255, 76, 175, 80),
            const Color.fromARGB(255, 255, 245, 59),
            const Color.fromARGB(255, 255, 229, 59),
            const Color.fromARGB(255, 255, 152, 0),
            const Color.fromARGB(255, 244, 67, 54),
            const Color.fromARGB(255, 156, 39, 176),
          ],
        ),
        text: const WebfabrikTextThemeData(
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
