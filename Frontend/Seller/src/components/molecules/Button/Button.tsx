import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { useTheme } from '@/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const Button = ({ label, onPress, disabled = false, loading }: ButtonProps) => {
  const { layout, gutters, fonts, backgrounds, borders, variant } = useTheme();

  return (
    <RNBounceable
      style={[
        layout.fullWidth,
        layout.itemsCenter,
        layout.justifyCenter,
        gutters.paddingVertical_12,
        gutters.marginTop_16,
        borders.rounded_16,
        backgrounds.gray800,
        disabled ? { opacity: 0.5 } : { opacity: 1 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          animating={loading}
          color={variant !== 'dark' ? '#fff' : '#000'}
        />
      ) : (
        <Text
          style={[
            fonts.size_16,
            fonts.bold,
            fonts.alignCenter,
            { color: variant === 'dark' ? '#000' : '#fff' },
          ]}
        >
          {label}
        </Text>
      )}
    </RNBounceable>
  );
};

export default Button;
