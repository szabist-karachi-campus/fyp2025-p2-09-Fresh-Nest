import type { RootStackParamList } from '@/navigation/types';

import { Toasts } from '@backpackapp-io/react-native-toast';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Paths } from '@/navigation/paths';

import {
  ChangePassword,
  Example,
  ForgotPassword,
  Login,
  OTP,
  Signup,
  Startup,
} from '@/screens';

import { StoresProvider } from '@/stores';

import AdminTabsNavigator from './AdminTabs';
import Tabs from './Tabs';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StoresProvider>
          <Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={Startup} name={Paths.Startup} />
            <Stack.Screen component={Example} name={Paths.Example} />
            <Stack.Screen component={Login} name={Paths.Login} />
            <Stack.Screen component={Signup} name={Paths.Signup} />
            <Stack.Screen
              component={ForgotPassword}
              name={Paths.ForgotPassword}
            />
            <Stack.Screen component={OTP} name={Paths.OTP} />
            <Stack.Screen
              component={ChangePassword}
              name={Paths.ChangePassword}
            />
            <Stack.Screen component={Tabs} name={Paths.Tabs} />
            <Stack.Screen
              component={AdminTabsNavigator}
              name={Paths.AdminTabs}
            />
          </Stack.Navigator>
        </StoresProvider>
      </NavigationContainer>

      <Toasts
        defaultStyle={{
          view: {
            backgroundColor: variant === 'dark' ? '#212331' : '#f7f7f7',
          },
          pressable: {
            backgroundColor: variant === 'dark' ? '#212331' : 'f7f7f7',
          },
          text: {
            color: variant === 'dark' ? 'white' : 'black',
          },
        }}
      />
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
