import { toast } from '@backpackapp-io/react-native-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { CommonActions, useNavigation } from '@react-navigation/native';
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

import { useUserLogin } from '@/queries/auth.queries';
import { useStores } from '@/stores';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Login = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { layout, gutters, fonts, variant } = useTheme();
  const { mutateAsync } = useUserLogin();
  const { auth, user } = useStores();

  const fields: Fields[] = [
    {
      name: 'email',
      type: 'email',
      placeholder: t('auth.login_screen.emailPlaceholder'),
      key: 'email',
      keyboardType: 'email-address',
    },
    {
      name: 'password',
      type: 'password',
      placeholder: t('auth.login_screen.passwordPlaceholder'),
      key: 'password',
      secure: true,
    },
  ];

  const validationLoginSchema = Yup.object({
    email: Yup.string()
      .trim()
      .required(t('auth.login_screen.emailRequired'))
      .email(t('auth.login_screen.emailInvalid')),
    password: Yup.string()
      .trim()
      .required(t('auth.login_screen.passwordRequired')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(validationLoginSchema),
    mode: 'onChange',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const onSubmit = handleSubmit(async (data: loginRequest) => {
    setLoading(true);
    try {
      console.log('auth device', auth.deviceToken);
      const response = await mutateAsync({
        email: data.email,
        password: data.password,
        deviceToken: auth.deviceToken.length > 2 ? auth.deviceToken : undefined,
      });

      if (response.data.success === true) {
        toast.success(response.data.message);
        auth.setMany({
          token: response.data.token,
          expiresAt: response.data.expiresAt,
          isSuperAdmin: response.data.vendor.isSuperAdmin,
        });
        user.setMany({
          email: response.data.vendor.email,
          name: response.data.vendor.name,
          phone: response.data.vendor.phone,
          verified: response.data.vendor.verified,
          cnic: response.data.vendor.cnic,
          isSuperAdmin: response.data.vendor.isSuperAdmin,
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Paths.Tabs }],
          }),
        );
        const targetPath = response.data.vendor.isSuperAdmin
          ? Paths.AdminTabs
          : Paths.Tabs;
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: targetPath }],
          }),
        );
      } else {
        toast.error(response.data.message);
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
            {t('auth.login_screen.loginTitle')}
          </Text>
          {fields.map((field) => {
            return (
              <Controller
                key={field.key}
                control={control}
                name={field.key as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    error={errors[field.key as 'email' | 'password']?.message}
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
          <Text
            onPress={() => navigation.navigate(Paths.ForgotPassword)}
            style={[
              fonts.size_12,
              gutters.marginTop_12,
              { color: variant === 'dark' ? '#fff' : '#000' },
            ]}
          >
            {t('auth.login_screen.forgotPassword')}
          </Text>
          <Button
            loading={loading}
            label={t('auth.login_screen.loginButton')}
            onPress={onSubmit}
          />
          <Text
            onPress={() => navigation.navigate(Paths.Signup)}
            style={[
              fonts.size_16,
              fonts.alignCenter,
              gutters.marginTop_12,
              { color: variant === 'dark' ? '#fff' : '#000' },
            ]}
          >
            {t('auth.login_screen.sellerSignupPrompt')}
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
};

export default Login;
