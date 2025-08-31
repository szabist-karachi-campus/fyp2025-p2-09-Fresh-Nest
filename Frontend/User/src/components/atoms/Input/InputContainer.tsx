import { useTheme } from '@/theme';
import React from 'react';
import { View } from 'react-native';

const InputContainer = ({ children }: { children: React.ReactNode }) => {
  const { gutters, borders } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
          height: 50,
        },

        gutters.paddingHorizontal_16,
        borders.w_1,
        borders.gray200,
        borders.rounded_16,
        gutters.marginTop_12,
      ]}
    >
      {children}
    </View>
  );
};

export default InputContainer;
