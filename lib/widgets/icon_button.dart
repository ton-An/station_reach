import 'package:flutter/cupertino.dart';
import 'package:webfabrik_theme/webfabrik_theme.dart';

class CustomIconButton extends StatelessWidget {
  const CustomIconButton({
    super.key,
    required this.onPressed,
    required this.icon,
    required this.iconColor,
  });

  final VoidCallback onPressed;
  final IconData icon;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    final WebfabrikThemeData theme = WebfabrikTheme.of(context);

    return FadeTapDetector(
      onTap: onPressed,
      child: Container(
        padding: EdgeInsets.all(theme.spacing.xSmall),
        decoration: BoxDecoration(
          color: theme.colors.translucentBackground,
          borderRadius: BorderRadius.circular(theme.radii.button),
        ),
        child: Icon(icon, size: 32, color: iconColor),
      ),
    );
  }
}
