import React from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '@/theme';

interface TextInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: keyboardType;
  style?: object;
  error?: string;
  handleChange: (text: string) => void;
  onBlur: () => void;
  value: any;
}

const Input = ({
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  style,
  handleChange,
  onBlur,
  value,
}: TextInputProps) => {
  const { variant } = useTheme();

  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={variant === 'dark' ? '#fff' : '#000'}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      onChange={(e) => handleChange(e.nativeEvent.text)}
      onBlur={onBlur}
      value={value}
      style={[
        {
          flex: 1,
          color: variant === 'dark' ? '#fff' : '#000',
        },

        style,
      ]}
    />
  );
};

export default Input;
