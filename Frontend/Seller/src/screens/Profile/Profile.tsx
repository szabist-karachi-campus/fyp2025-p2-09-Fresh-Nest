import RNBounceable from '@freakycoder/react-native-bounceable';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { getI18n } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';

import { useTheme } from '@/theme';
import { useI18n } from '@/hooks';
import { SupportedLanguages } from '@/hooks/language/schema';
import { Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { Button, ToggleBox } from '@/components/molecules';
import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import {
  useGetCert,
  useGetWalletBalance,
  useUploadCertification,
} from '@/queries/auth.queries';
import { useStores } from '@/stores';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Profile = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, auth } = useStores();
  const { data: wallet } = useGetWalletBalance(true);
  const { toggleLanguage } = useI18n();
  const selectedLanguage = getI18n().language;
  const { layout, borders, gutters, fonts, variant, changeTheme } = useTheme();
  const { mutateAsync, isPending } = useUploadCertification();
  const [isDarkTheme, setIsDarkTheme] = useState(variant === 'dark');
  const { data } = useGetCert();

  const onChangeTheme = () => {
    changeTheme(isDarkTheme ? 'default' : 'dark');
    setIsDarkTheme(!isDarkTheme);
  };

  const [certificate, setCertificate] = useState<ImagePickerResponse>();
  const handleCertificateUpload = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 1,
      selectionLimit: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorCode) {
        console.log(
          response.didCancel
            ? 'User cancelled image picker'
            : response.errorMessage,
        );
        return;
      }
      setCertificate(response);
    }).then(() => {
      Alert.alert(
        'Upload Certificate',
        'Are you sure you want to upload this certificate? You will not be able to change it again',
        [
          {
            text: 'Cancel',
            style: 'destructive',
          },
          {
            text: 'Upload',
            style: 'default',
            onPress: async () => {
              // @ts-expect-error
              await mutateAsync(certificate?.assets[0]).then(() => {
                setCertificate(undefined);
              });
            },
          },
        ],
        { cancelable: true },
      );
    });
  };

  return (
    <SafeScreen style={[layout.flex_1, gutters.marginHorizontal_24]}>
      <View
        style={[
          layout.row,
          layout.justifyBetween,
          layout.itemsCenter,
          gutters.marginBottom_24,
        ]}
      >
        <Text style={[fonts.bold, fonts.size_24, fonts.gray800]}>Profile</Text>
        <RNBounceable
          onPress={() =>
            navigation.navigate(Paths.WalletDetails, { id: wallet?.wallet._id })
          }
          style={[
            layout.row,
            layout.itemsCenter,
            borders.rounded_16,
            gutters.paddingHorizontal_12,
            gutters.paddingVertical_8,
            { backgroundColor: 'green' },
          ]}
        >
          <Icons.SimpleLineIcons
            name="wallet"
            size={20}
            color={'#fff'}
            style={gutters.marginRight_8}
          />
          <Text style={[fonts.bold, fonts.size_12, { color: '#fff' }]}>
            {wallet?.wallet.balance ?? 0}
          </Text>
        </RNBounceable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[layout.itemsCenter, layout.justifyCenter]}>
          <Icons.MaterialCommunityIcons
            name="account-circle"
            size={200}
            color={variant === 'dark' ? '#fff' : '#000'}
          />
          <Text
            style={[
              fonts.bold,
              fonts.size_32,
              fonts.gray800,
              gutters.marginVertical_24,
            ]}
          >
            {user.name}
          </Text>
          <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
            {user.email}
          </Text>
          <Text
            style={[
              fonts.bold,
              fonts.size_16,
              fonts.gray800,
              gutters.marginBottom_12,
            ]}
          >
            {user.phone}
          </Text>
        </View>

        <View style={layout.itemsCenter}>
          <ToggleBox
            label="Theme"
            value={isDarkTheme}
            onPress={onChangeTheme}
            activeText="Dark"
            inactiveText="Light"
          />
          <ToggleBox
            label="Language"
            onPress={toggleLanguage}
            activeText="English"
            inactiveText="Urdu"
            value={selectedLanguage !== SupportedLanguages.FR_FR}
          />
        </View>

        <View style={gutters.marginTop_24}>
          <Button
            onPress={() =>
              navigation.navigate(Paths.ChangePassword, { email: user.email })
            }
            label="Change Password"
          />
          <Button
            disabled={isPending || data?.cert}
            onPress={handleCertificateUpload}
            label={data?.cert ? 'Certification Uploaded' : 'Upload Certificate'}
          />
          <Button
            onPress={() => {
              auth.setMany({
                token: '',
                isSuperAdmin: false,
              });
              user.setMany({
                name: '',
                email: '',
                phone: '',
                verified: false,
                cnic: '',
              });
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: Paths.Login }],
                }),
              );
            }}
            label="Logout"
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default Profile;
