import { toast } from '@backpackapp-io/react-native-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import * as Yup from 'yup';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { Button, Input } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

import { useChangePassword } from '@/queries/auth.queries';

type NavigationProps = StackNavigationProp<RootStackParamList>;

const ChangePassword = () => {
  const { t } = useTranslation();
  const { variant, layout, gutters, fonts } = useTheme();
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProp<RootStackParamList>>();
  const { mutateAsync } = useChangePassword();
  const params = route.params ?? {};
  const email = 'email' in params ? params.email : undefined;
  const fileds: Fields[] = [
    {
      name: 'newPassword',
      type: 'password',
      placeholder: t('auth.changePassword.newPasswordLabel'),
      key: 'newPassword',
      secure: true,
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: t('auth.changePassword.confirmPasswordLabel'),
      key: 'confirmPassword',
      secure: true,
    },
  ];

  const validationChangePasswordSchema = Yup.object({
    newPassword: Yup.string()
      .trim()
      .required(t('auth.changePassword.passwordRequired'))
      .min(6, t('auth.changePassword.passwordShort')),
    confirmPassword: Yup.string()
      .trim()
      .required(t('auth.changePassword.passwordRequired'))
      .oneOf(
        [Yup.ref('newPassword')],
        t('auth.changePassword.passwordMismatchError'),
      ),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    resolver: yupResolver(validationChangePasswordSchema),
    mode: 'onChange',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const response = await mutateAsync({
        //@ts-ignore
        email: email,
        password: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      console.log(response);
      if (response.data.success === true) {
        toast.success(response.data.message);
        navigation.navigate(Paths.Login);
        setLoading(false);
      } else {
        toast.error(response.data.message);
        console.log(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.data.message);
    } finally {
      setLoading(false);
    }
  });
  return (
    <SafeScreen>
      <View style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}>
        <View
          style={[layout.itemsCenter, layout.justifyCenter, { width: '80%' }]}
        >
          <Text
            style={[
              fonts.bold,
              fonts.size_24,
              gutters.marginBottom_24,
              { color: variant === 'dark' ? '#fff' : '#000' },
            ]}
          >
            {t('auth.changePassword.changePasswordTitle')}
          </Text>
          {fileds.map((field) => {
            return (
              <Controller
                key={field.key}
                control={control}
                name={field.key as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    error={
                      errors[field.key as 'newPassword' | 'confirmPassword']
                        ?.message
                    }
                    secure={field.secure}
                    placeholder={field.placeholder}
                    value={value}
                    onBlur={onBlur}
                    handleChange={onChange}
                    keyboardType={
                      field.keyboardType ? field.keyboardType : 'default'
                    }
                  />
                )}
              />
            );
          })}
          <Button
            loading={loading}
            label={t('auth.changePassword.submitButton')}
            onPress={onSubmit}
          />
        </View>
      </View>
    </SafeScreen>
  );
};

export default ChangePassword;
