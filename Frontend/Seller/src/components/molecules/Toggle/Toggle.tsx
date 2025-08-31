import React from 'react';
import { Text, View } from 'react-native';
import Toggle from 'react-native-toggle-element';

import { useTheme } from '@/theme';

type ToggleBoxProps = {
  label: string;
  value: boolean;
  onPress: () => void;
  activeText: string;
  inactiveText: string;
};

const ToggleBox = ({
  label,
  value,
  onPress,
  activeText,
  inactiveText,
}: ToggleBoxProps) => {
  const { colors, fonts, gutters } = useTheme();
  return (
    <View>
      <Text
        style={[
          fonts.gray800,
          fonts.size_16,
          fonts.bold,
          gutters.marginVertical_12,
        ]}
      >
        {label}
      </Text>
      <Toggle
        value={value}
        onPress={onPress}
        thumbActiveComponent={
          <Text
            style={[
              fonts.gray800,
              fonts.size_16,
              fonts.bold,
              gutters.marginVertical_12,
              fonts.alignCenter,
            ]}
          >
            {activeText}
          </Text>
        }
        thumbInActiveComponent={
          <Text
            style={[
              fonts.gray800,
              fonts.size_16,
              fonts.bold,
              gutters.marginVertical_12,
              fonts.alignCenter,
            ]}
          >
            {inactiveText}
          </Text>
        }
        trackBar={{
          radius: 8,
          width: 350,
          activeBackgroundColor: colors.gray800,
          inActiveBackgroundColor: colors.gray800,
        }}
        thumbStyle={{
          backgroundColor: colors.gray100,
          zIndex: 1,
        }}
        thumbButton={{
          radius: 8,
          width: 180,
        }}
        animationDuration={500}
      />
    </View>
  );
};

export default ToggleBox;
