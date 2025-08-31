import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { useTheme } from '@/theme';

interface IconProps {
  onPress: any;
  size?: number;
  secure?: boolean;
}

const EyeIcon = ({ onPress, size = 20, secure }: IconProps) => {
  const { variant } = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress(!secure)}>
      <FontAwesome5
        name={secure ? 'eye' : 'eye-slash'}
        size={size}
        color={variant === 'dark' ? '#fff' : '#000'}
      />
    </TouchableOpacity>
  );
};

export default EyeIcon;
