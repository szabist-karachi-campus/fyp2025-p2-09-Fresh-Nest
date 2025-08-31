import React, { useState } from 'react';
import { Input as TextField, InputContainer, EyeIcon } from '../../atoms';
import { HelperText } from 'react-native-paper';

interface InputProps {
  placeholder: string;
  keyboardType: keyboardType;
  secure?: boolean;
  error?: string;
  handleChange: (text: string) => void;
  onBlur: () => void;
  value: any;
}

const Input = ({
  placeholder,
  keyboardType,
  error,
  handleChange,
  onBlur,
  value,
  secure,
}: InputProps) => {
  const [Secure, setSecure] = useState<boolean>(secure ? secure : false);

  return (
    <>
      <InputContainer>
        <TextField
          placeholder={placeholder}
          secureTextEntry={Secure}
          keyboardType={keyboardType}
          error={error}
          handleChange={handleChange}
          onBlur={onBlur}
          value={value}
        />
        {secure && (
          <EyeIcon secure={Secure} onPress={() => setSecure(!Secure)} />
        )}
      </InputContainer>
      {error && (
        <HelperText type="error" visible={error ? true : false}>
          {error}
        </HelperText>
      )}
    </>
  );
};

export default Input;
