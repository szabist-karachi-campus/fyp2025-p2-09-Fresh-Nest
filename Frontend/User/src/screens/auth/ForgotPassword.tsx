import { Text, View } from 'react-native';
import React, { useState } from 'react';
import { SafeScreen } from '@/components/template';
import { useTheme } from '@/theme';
import { Button, Input } from '@/components/molecules';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { toast } from '@backpackapp-io/react-native-toast';
import { useForgotPassword } from '@/queries/auth.queries';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type ForgotPasswordScreenProps = StackNavigationProp<
  RootStackParamList,
  Paths.Forgot
>;

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordScreenProps>();
  const { t } = useTranslation();
  const { layout, gutters, fonts, variant } = useTheme();
  const { mutateAsync } = useForgotPassword();

  const fields: Fields[] = [
    {
      name: 'email',
      type: 'email',
      placeholder: t('forgotPassword.emailPlaceholder'),
      key: 'email',
      keyboardType: 'email-address',
    },
  ];

  const validationForgotPasswordSchema = Yup.object({
    email: Yup.string()
      .trim()
      .required(t('forgotPassword.emailRequired'))
      .email(t('forgotPassword.emailInvalid')),
    type: Yup.string().required(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      type: 'resetEmail',
    },
    resolver: yupResolver(validationForgotPasswordSchema),
    mode: 'onChange',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = handleSubmit(async (data: forgotPasswordRequest) => {
    setLoading(true);
    try {
      const response = await mutateAsync({
        email: data.email,
        type: 'resetEmail',
      });
      if (response.success === true) {
        toast.success(response.message);
        navigation.navigate(Paths.OTP, {
          email: data.email,
          context: 'forgotPassword',
        });
        setLoading(false);
      } else {
        toast.error(response.message);
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <SafeScreen>
      <View style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}>
        <View style={[layout.justifyCenter, { width: '80%' }]}>
          <Text
            style={[
              fonts.bold,
              fonts.size_32,
              fonts.alignCenter,
              gutters.marginBottom_32,
              { color: variant === 'dark' ? '#fff' : '#000' },
            ]}
          >
            {t('forgotPassword.forgotPasswordTitle')}
          </Text>
          {fields.map((field) => {
            return (
              <Controller
                key={field.key}
                control={control}
                name={field.key as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    error={errors[field.key as 'email']?.message}
                    handleChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    key={field.key}
                    secure={field.secure}
                    keyboardType={
                      field.keyboardType ? field.keyboardType : 'default'
                    }
                    placeholder={field.placeholder}
                  />
                )}
              />
            );
          })}

          <Button
            loading={loading}
            label={t('forgotPassword.submitButton')}
            onPress={onSubmit}
          ></Button>
        </View>
      </View>
    </SafeScreen>
  );
};

export default ForgotPassword;
