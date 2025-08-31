import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { Text, TextStyle, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

const DashboardButton = ({
  title,
  icon,
  style,
  lableStyle,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  style?: ViewStyle;
  lableStyle?: TextStyle;
  onPress?: () => void;
}) => {
  const { layout, borders, gutters, backgrounds } = useTheme();

  return (
    <RNBounceable
      onPress={onPress}
      style={[
        layout.row,
        layout.itemsCenter,
        backgrounds.gray100,
        borders.rounded_16,
        gutters.padding_16,
        { marginBottom: 16, elevation: 2 },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          { fontSize: 16, fontWeight: '600', marginLeft: 12 },
          lableStyle,
        ]}
      >
        {title}
      </Text>
    </RNBounceable>
  );
};

export default DashboardButton;
