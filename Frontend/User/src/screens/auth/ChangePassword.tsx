import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { SafeScreen } from '@/components/template';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import { Button, Input } from '@/components/molecules';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { useChangePassword } from '@/queries/auth.queries';
import { toast } from '@backpackapp-io/react-native-toast';
import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type ChangePasswordScreenProps = StackNavigationProp<
  RootStackParamList,
  Paths.ChangePassword
>;
type ChangePasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  Paths.ChangePassword
>;

const ChangePassword = () => {
  const { t } = useTranslation();
  const { variant, layout, gutters, fonts } = useTheme();
  const navigation = useNavigation<ChangePasswordScreenProps>();
  const route = useRoute<ChangePasswordScreenRouteProp>();
  const { mutateAsync } = useChangePassword();
  const params = route.params ?? {};
  const email = 'email' in params ? params.email : undefined;
  const fileds: Fields[] = [
    {
      name: 'newPassword',
      type: 'password',
      placeholder: t('changePassword.newPasswordLabel'),
      key: 'newPassword',
      secure: true,
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: t('changePassword.confirmPasswordLabel'),
      key: 'confirmPassword',
      secure: true,
    },
  ];

  const validationChangePasswordSchema = Yup.object({
    newPassword: Yup.string()
      .trim()
      .required(t('changePassword.passwordRequired'))
      .min(6, t('changePassword.passwordShort')),
    confirmPassword: Yup.string()
      .trim()
      .required(t('changePassword.passwordRequired'))
      .oneOf(
        [Yup.ref('newPassword')],
        t('changePassword.passwordMismatchError'),
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
      if (response.data.success === true) {
        toast.success(response.data.message);
        toast.success('Please Login Again');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Paths.Login }],
          }),
        );
        setLoading(false);
      } else {
        toast.error(response.data.message);
      }
      console.log(response.data);
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
            {t('changePassword.changePasswordTitle')}
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
        </View>
        <Button
          loading={loading}
          label={t('changePassword.submitButton')}
          onPress={onSubmit}
          containerStyle={{
            marginTop: 24,
            width: '80%',
            alignSelf: 'center',
          }}
        />
      </View>
    </SafeScreen>
  );
};

export default ChangePassword;
