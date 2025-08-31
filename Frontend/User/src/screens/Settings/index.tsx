import { View } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { Button } from '@/components/molecules';
import { useStores } from '@/stores';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getI18n, useTranslation } from 'react-i18next';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import ToggleBox from '@/components/molecules/Toggle/Toggle';
import { SupportedLanguages } from '@/hooks/language/schema';
import { useI18n } from '@/hooks';

type SettingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.Settings
>;

const Settings = () => {
  const navigation = useNavigation<SettingScreenNavigationProp>();

  const { auth, user, cart } = useStores();
  const { t } = useTranslation();
  const { toggleLanguage } = useI18n();
  const selectedLanguage = getI18n().language;
  const { variant, changeTheme, layout, gutters } = useTheme();

  const [isDarkTheme, setIsDarkTheme] = useState(variant === 'dark');

  const onChangeTheme = () => {
    const newVariant = isDarkTheme ? 'default' : 'dark';
    changeTheme(newVariant);
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <View style={[layout.flex_1, gutters.margin_24, layout.col]}>
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.justifyAround,
          layout.fullWidth,
        ]}
      >
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
        <View>
          <Button
            label={t('settings.change_password_button')}
            onPress={() => {
              navigation.navigate(Paths.ChangePassword, { email: user.email });
            }}
          />
          <Button
            label={t('settings.logout_button')}
            onPress={() => {
              auth.set('token', '');
              user.setMany({ name: '', email: '', phone: '', verified: false });
              cart.clearCart();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: Paths.Login }],
                }),
              );
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default Settings;
