import { Text, View } from 'react-native';

import { Gap } from '@/core/components/gap';
import { SmallIconButton } from '@/core/components/small-icon-button';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

interface HeaderProps {
  readonly title: string;
  /** Shows a back button when given. Absent means this is the root pane. */
  readonly onBack?: () => void;
}

/** The sheet's title bar, a filled pill rather than bare text. */
export function Header({ title, onBack }: HeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.medium,
        paddingVertical: theme.spacing.medium + theme.spacing.small,
        borderRadius: theme.radii.medium,
        backgroundColor: theme.colors.translucentBackgroundContrast,
      }}
    >
      {onBack !== undefined && (
        <>
          <SmallIconButton
            icon="chevronLeft"
            onPress={onBack}
            alignmentOffset={[-1, 0]}
            accessibilityLabel={t('back')}
          />
          <Gap size="medium" />
        </>
      )}

      <View style={{ flex: 1, paddingVertical: theme.spacing.small }}>
        <Text
          numberOfLines={2}
          style={[
            theme.text.title1,
            { color: theme.colors.text, fontWeight: '600' },
          ]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}
