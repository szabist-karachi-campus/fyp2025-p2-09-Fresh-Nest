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
import { useUserSignup } from '@/queries/auth.queries';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type SignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.Signup
>;

export default function Signup() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { t } = useTranslation();
  const { layout, gutters, fonts, variant } = useTheme();
  const { mutateAsync } = useUserSignup();

  const fields: Fields[] = [
    {
      name: 'name',
      type: 'name',
      placeholder: t('signup.namePlaceholder'),
      key: 'name',
    },
    {
      name: 'email',
      type: 'email',
      placeholder: t('signup.emailPlaceholder'),
      key: 'email',
      keyboardType: 'email-address',
    },
    {
      name: 'contact no.',
      type: 'contact no.',
      placeholder: t('signup.contactPlaceholder'),
      key: 'phone',
      keyboardType: 'phone-pad',
    },
    {
      name: 'password',
      type: 'password',
      placeholder: t('signup.passwordPlaceholder'),
      key: 'password',
      secure: true,
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: t('signup.confirmPasswordPlaceholder'),
      key: 'confirmPassword',
      secure: true,
    },
  ];
  const validationSignupSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required(t('signup.nameRequired'))
      .min(3, t('signup.nameShort'))
      .max(50, t('signup.nameLong')),
    email: Yup.string()
      .trim()
      .required(t('signup.emailRequired'))
      .email(t('signup.emailInvalid')),
    phone: Yup.string()
      .trim()
      .required(t('signup.phoneRequired'))
      .min(10, t('signup.phoneShort'))
      .matches(/^(\+92\d{10}|03\d{9})$/, t('signup.phoneInvalid')),
    password: Yup.string()
      .trim()
      .required(t('signup.passwordRequired'))
      .min(6, t('signup.passwordShort'))
      .max(50, t('signup.passwordLong')),
    confirmPassword: Yup.string()
      .trim()
      .required(t('signup.conformPasswordRequired'))
      .oneOf([Yup.ref('password')], t('signup.passwordMismatch')),
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
            {t('signup.signupTitle')}
          </Text>
          {fields.map((field, index) => {
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
            label={t('signup.signupButton')}
            onPress={onSubmit}
          />
          <Text
            onPress={() => navigation.goBack()}
            style={[
              fonts.size_16,
              fonts.alignCenter,
              gutters.marginTop_12,
              { color: variant === 'dark' ? '#fff' : '#000' },
            ]}
          >
            {t('signup.loginPrompt')}
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
}
