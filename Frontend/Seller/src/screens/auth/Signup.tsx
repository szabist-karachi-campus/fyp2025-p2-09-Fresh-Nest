import { toast } from '@backpackapp-io/react-native-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
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

import { useUserSignup } from '@/queries/auth.queries';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function Signup() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { layout, gutters, fonts, variant } = useTheme();
  const { mutateAsync } = useUserSignup();

  const fields: Fields[] = [
    {
      name: 'name',
      type: 'name',
      placeholder: t('auth.signup.namePlaceholder'),
      key: 'name',
    },
    {
      name: 'email',
      type: 'email',
      placeholder: t('auth.signup.emailPlaceholder'),
      key: 'email',
      keyboardType: 'email-address',
    },
    {
      name: 'contact no.',
      type: 'contact no.',
      placeholder: t('auth.signup.contactPlaceholder'),
      key: 'phone',
      keyboardType: 'phone-pad',
    },
    {
      name: 'cnic',
      type: 'cnic',
      placeholder: t('auth.signup.cnicPlaceholder'),
      key: 'cnic',
      keyboardType: 'phone-pad',
    },
    {
      name: 'password',
      type: 'password',
      placeholder: t('auth.signup.passwordPlaceholder'),
      key: 'password',
      secure: true,
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: t('auth.signup.confirmPasswordPlaceholder'),
      key: 'confirmPassword',
      secure: true,
    },
  ];

  const validationSignupSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required(t('auth.signup.nameRequired'))
      .min(3, t('auth.signup.nameShort'))
      .max(50, t('auth.signup.nameLong')),
    email: Yup.string()
      .trim()
      .required(t('auth.signup.emailRequired'))
      .email(t('auth.signup.emailInvalid')),
    phone: Yup.string()
      .trim()
      .required(t('auth.signup.phoneRequired'))
      .min(10, t('auth.signup.phoneShort'))
      .matches(/^(\+92\d{10}|03\d{9})$/, t('auth.signup.phoneInvalid')),
    cnic: Yup.string()
      .trim()
      .required(t('auth.signup.cnicRequired'))
      .matches(/^[0-9+]{5}-[0-9+]{7}-[0-9]{1}$/, t('auth.signup.cnicInvalid')),
    password: Yup.string()
      .trim()
      .required(t('auth.signup.passwordRequired'))
      .min(6, t('auth.signup.passwordShort'))
      .max(50, t('auth.signup.passwordLong')),
    confirmPassword: Yup.string()
      .trim()
      .required(t('auth.signup.conformPasswordRequired'))
      .oneOf([Yup.ref('password')], t('auth.signup.passwordMismatch')),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    resolver: yupResolver(validationSignupSchema),
    mode: 'onChange',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = handleSubmit(async (data: signupRequest) => {
    setLoading(true);
    try {
      const response = await mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cnic: data.cnic,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (response.data.success === true) {
        toast.success(response.data.message);
        navigation.navigate(Paths.OTP, {
          email: data.email,
          context: 'signUp',
        });
      } else if (response.data.success === false) {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
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
            {t('auth.signup.signupTitle')}
          </Text>
          {fields.map((field) => {
            return (
              <Controller
                key={field.key}
                control={control}
                name={field.key as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    error={
                      errors[
                        field.key as
                          | 'email'
                          | 'password'
                          | 'name'
                          | 'phone'
                          | 'confirmPassword'
                      ]?.message
                    }
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
            label={t('auth.signup.signupButton')}
            onPress={onSubmit}
          />
          <Text
            onPress={() => navigation.navigate(Paths.Login)}
            style={[
              fonts.size_16,
              fonts.alignCenter,
              gutters.marginTop_12,
              { color: variant === 'dark' ? '#fff' : '#000' },
            ]}
          >
            {t('auth.signup.loginPrompt')}
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
}
