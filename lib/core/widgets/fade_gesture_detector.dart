import 'package:flutter/material.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

/// {@template fade_tap_detector}
/// A widget that provides tap and long-press detection with a fade animation
/// on tap-down.
///
/// This widget wraps its [child] with a [GestureDetector] to handle tap and
/// long-press events. When the user taps down on the widget, it animates a
/// fade effect (reducing opacity). The opacity is restored when the tap is
/// released or cancelled.
///
/// It uses an [AnimationController] and [FadeTransition] to achieve the
/// fade effect.
/// {@endtemplate}
class FadeGestureDetector extends StatefulWidget {
  /// {@macro fade_tap_detector}
  const FadeGestureDetector({
    super.key,
    required this.child,
    this.behavior = HitTestBehavior.translucent,
    this.onTap,
    this.onLongPress,
    this.minOpacity = .6,
  });

  /// How the gesture detector should behave during hit testing.
  final HitTestBehavior? behavior;

  /// Callback triggered when the widget is tapped.
  final VoidCallback? onTap;

  /// Callback triggered when the widget is long-pressed.
  final VoidCallback? onLongPress;

  /// The widget below this widget in the tree that receives the tap and fade effect.
  final Widget child;

  /// The minimum opacity to reach when the widget is tapped.
  final double minOpacity;

  @override
  State<FadeGestureDetector> createState() => _FadeGestureDetectorState();
}

class _FadeGestureDetectorState extends State<FadeGestureDetector>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  bool _didInitAnimation = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    if (!_didInitAnimation) {
      _fadeController = AnimationController(
        duration: theme.durations.short,
        vsync: this,
      );

      _fadeAnimation = Tween<double>(
        begin: 1,
        end: widget.minOpacity,
      ).chain(CurveTween(curve: Curves.easeInOut)).animate(_fadeController);

      _didInitAnimation = true;
    } else {
      _fadeController.duration = theme.durations.short;
    }

    _fadeController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => _fadeController.animateTo(.5),
      onExit: (_) => _fadeController.animateTo(0),
      child: GestureDetector(
        behavior: widget.behavior,
        onLongPress: widget.onLongPress,
        onTapDown: (_) => _onTapDown(),
        onTapUp: (_) => _onTapUp(),
        onTapCancel: _onTapCancel,
        child: FadeTransition(opacity: _fadeAnimation, child: widget.child),
      ),
    );
  }

  void _onTapDown() => _fadeController.forward();

  Future<void> _onTapUp() async {
    widget.onTap?.call();
    if (_fadeController.isCompleted) {
      await _fadeController.reverse();
    } else {
      await _fadeController.forward();
      await _fadeController.reverse();
    }
  }

  void _onTapCancel() => _fadeController.reverse();
}
