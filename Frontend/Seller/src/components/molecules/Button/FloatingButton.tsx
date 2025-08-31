import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';

import { useTheme } from '@/theme';

import * as Icons from '@/components/molecules/icons';

interface FloatingButtonProps {
  onPress: () => void;
  icon: string;
}

const FloatingButton = ({ onPress, icon }: FloatingButtonProps) => {
  const { components, variant } = useTheme();

  return (
    <RNBounceable
      onPress={onPress}
      style={[
        {
          position: 'absolute',
          bottom: 24,
          right: 16,
        },
        components.buttonCircle,
      ]}
    >
      <Icons.FontAwesome5
        name={icon}
        size={24}
        color={variant === 'dark' ? '#000' : '#fff'}
      />
    </RNBounceable>
  );
};

export default FloatingButton;
