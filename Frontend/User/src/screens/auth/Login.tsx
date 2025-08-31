import { Text, View } from 'react-native';
import React, { useState } from 'react';
import { SafeScreen } from '@/components/template';
import { useTheme } from '@/theme';
import { Button, Input } from '@/components/molecules';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from '@backpackapp-io/react-native-toast';
import { useUserLogin } from '@/queries/auth.queries';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useStores } from '@/stores';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.Login
>;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t } = useTranslation();
  const { layout, gutters, fonts, variant } = useTheme();
  const { mutateAsync } = useUserLogin();
  const { auth, user } = useStores();

  const fields: Fields[] = [
    {
      name: 'email',
      type: 'email',
      placeholder: t('login.emailPlaceholder'),
      key: 'email',
      keyboardType: 'email-address',
    },
    {
      name: 'password',
      type: 'password',
      placeholder: t('login.passwordPlaceholder'),
      key: 'password',
      secure: true,
    },
  ];

  const validationLoginSchema = Yup.object({
    email: Yup.string()
      .trim()
      .required(t('login.emailRequired'))
      .email(t('login.emailInvalid')),
    password: Yup.string().trim().required(t('login.passwordRequired')),
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
      const response = await mutateAsync({
        email: data.email,
        password: data.password,
      });

      if (response.data.success === true) {
        toast.success(response.data.message);
        auth.setMany({
          token: response.data.token,
          expiresAt: response.data.expiresAt,
        });
        user.setMany({
          email: response.data.user.email,
          name: response.data.user.name,
          phone: response.data.user.phone,
          verified: response.data.user.verified,
          address: response.data.user.address,
          city: response.data.user.city,
          state: response.data.user.state,
          postalcode: response.data.user.postalcode,
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Paths.Tabs }],
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
            {t('login.loginTitle')}
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
            onPress={() => navigation.navigate(Paths.Forgot)}
            style={[
              fonts.size_12,
              gutters.marginTop_12,
              { color: variant === 'dark' ? '#fff' : '#000' },
            ]}
          >
            {t('login.forgotPassword')}
          </Text>
          <Button
            loading={loading}
            label={t('login.loginButton')}
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
            {t('login.signupPrompt')}
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
};

export default Login;
