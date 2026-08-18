import { Text, View } from 'react-native';

import { Gap } from '@/core/components/gap';
import { SmallIconButton } from '@/core/components/small-icon-button';
import { t } from '@/core/i18n/translate';
import { useTheme } from '@/core/theme/use-theme';

interface ModalHeaderProps {
  readonly title: string;
  readonly onBack?: () => void;
}

export function ModalHeader({
  title,
  onBack,
}: ModalHeaderProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xMedium,
        paddingVertical: theme.spacing.medium + theme.spacing.small,
        borderRadius: theme.radii.large,
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
