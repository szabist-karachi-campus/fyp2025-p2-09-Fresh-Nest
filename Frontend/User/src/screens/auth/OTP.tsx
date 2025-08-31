import { View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { OtpInput } from 'react-native-otp-entry';
import { useTheme } from '@/theme';
import { Button } from '@/components/molecules';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useForgotPassword, useVerifyOTP } from '@/queries/auth.queries';
import { toast } from '@backpackapp-io/react-native-toast';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

type OTPScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.OTP
>;
type OTPScreenRouteProp = RouteProp<RootStackParamList, Paths.OTP>;

const OTP = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<OTPScreenRouteProp>();
  const { variant, layout, gutters, fonts } = useTheme();
  const [isResendDisabled] = useState(true);
  const params = route.params ?? {};
  const email: string = 'email' in params ? (params.email as string) : '';
  const context: string = 'context' in params ? (params.context as string) : '';
  const { mutateAsync: resetOTPMutateAsync } = useForgotPassword();
  const { mutateAsync: verifyMutateAsync } = useVerifyOTP();
  const resendOTP = async () => {
    if (seconds > 0) return;
    if (email) {
      try {
        let response;
        if (context === 'signUp') {
          response = await resetOTPMutateAsync({ email, type: 'welcomeEmail' });
          console.log(response.data);
        } else if (context === 'forgotPassword') {
          response = await resetOTPMutateAsync({ email, type: 'resetEmail' });
          console.log(response.data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    }

    setSeconds(30);
    toast.success('OTP sent successfully');
  };
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [seconds]);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: verifyOTP) => {
    setLoading(true);
    if (otp.length < 4) {
      return toast.error('Please enter a valid OTP');
    }
    try {
      const response = await verifyMutateAsync({
        //@ts-ignore
        email: data.email,
        otp: data.otp,
        type: context === 'forgotPassword' ? 'resetEmail' : 'welcomeEmail',
      });
      if (response.data.success === true) {
        toast.success(response.data.message);
        if (context === 'forgotPassword') {
          navigation.navigate(Paths.ChangePassword, { email: data.email });
        } else if (context === 'signUp') {
          console.log(response.data);
          response.data.verified = true;
          navigation.navigate(Paths.Login);
        }
        setLoading(false);
      } else {
        toast.error(response.data.message);
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <View style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}>
      <View style={[layout.justifyCenter, { width: '80%' }]}>
        <Text
          style={[
            fonts.bold,
            fonts.size_24,
            fonts.alignCenter,
            gutters.marginBottom_24,
            { color: variant === 'dark' ? '#fff' : '#000' },
          ]}
        >
          {t('otp.otpTitle')}
        </Text>
        <OtpInput
          type="numeric"
          numberOfDigits={4}
          focusColor="green"
          focusStickBlinkingDuration={500}
          onTextChange={(text) => console.log(text)}
          onFilled={(text) => setOtp(text)}
          textInputProps={{
            accessibilityLabel: 'One-Time Password',
          }}
          theme={{
            containerStyle: { width: '80%', alignSelf: 'center' },
            pinCodeTextStyle: { color: variant === 'dark' ? '#fff' : '#000' },
          }}
        />

        <Button
          loading={loading}
          label={t('otp.verifyButton')}
          onPress={() =>
            onSubmit({
              email: email as string,
              otp,
              type: '',
            })
          }
        />

        <RNBounceable
          disabled={seconds > 0}
          onPress={resendOTP}
          style={[layout.itemsCenter]}
        >
          <Text
            style={[
              gutters.marginTop_12,
              fonts.size_12,
              seconds > 0 ? fonts.gray400 : fonts.gray800,
            ]}
          >
            {seconds > 0 ? `Resend OTP in ${seconds}` : 'Resend OTP'}
          </Text>
        </RNBounceable>

        <Text
          style={{
            color: isResendDisabled
              ? 'grey'
              : variant === 'dark'
                ? '#fff'
                : '#000',
            textAlign: 'center',
          }}
        ></Text>
      </View>
    </View>
  );
};

export default OTP;
