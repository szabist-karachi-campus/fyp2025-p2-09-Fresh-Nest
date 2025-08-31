import type { RootScreenProps } from '@/navigation/types';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Text, View } from 'react-native';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { SafeScreen } from '@/components/template';
import { CommonActions } from '@react-navigation/native';
import { useStores } from '@/stores';

function Startup({ navigation }: RootScreenProps<Paths.Startup>) {
  const { fonts, gutters, layout } = useTheme();
  const { t } = useTranslation();
  const { auth } = useStores();

  const { isError, isFetching, isSuccess } = useQuery({
    queryFn: () => {
      return Promise.resolve(true);
    },
    queryKey: ['startup'],
  });

  useEffect(() => {
    if (isSuccess) {
      if (auth.token.length > 2) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Paths.Tabs }],
          }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Paths.Login }],
          }),
        );
      }
      // navigation.dispatch(
      //       CommonActions.reset({
      //         index: 0,
      //         routes: [{ name: 'Login' }],
      //       })
      //     );
    }
  }, [isSuccess, navigation]);

  return (
    <SafeScreen>
      <View
        style={[
          layout.flex_1,
          layout.col,
          layout.itemsCenter,
          layout.justifyCenter,
        ]}
      >
        <Image
          source={require('@/assets/logo.png')}
          style={{ width: 300, height: 300 }}
          resizeMode="contain"
        />
        {isFetching ? (
          <ActivityIndicator size="large" style={[gutters.marginVertical_24]} />
        ) : undefined}
        {isError ? (
          <Text style={[fonts.size_16, fonts.red500]}>{t('common_error')}</Text>
        ) : undefined}
      </View>
    </SafeScreen>
  );
}

export default Startup;
