import type { RootStackParamList } from '@/navigation/types';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toasts } from '@backpackapp-io/react-native-toast';

import { Paths } from '@/navigation/paths';
import { useTheme } from '@/theme';

import { Startup, Login, Signup, Forgot, OTP, ChangePassword } from '@/screens';
import { useNetwork } from '@/providers/NetworkProvider';
import NoConnection from '@/screens/noConnection';
import BottomTabsNavigator from './BottomTabsNavigator';

const Stack = createStackNavigator<RootStackParamList>();

function ApplicationNavigator() {
  const { navigationTheme, variant } = useTheme();
  const isConnected = useNetwork();

  return (
    <SafeAreaProvider>
      {!isConnected ? (
        <NoConnection />
      ) : (
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator key={variant} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={Startup} name={Paths.Startup} />
            <Stack.Screen name={Paths.Login} component={Login} />
            <Stack.Screen name={Paths.Signup} component={Signup} />
            <Stack.Screen name={Paths.Forgot} component={Forgot} />
            <Stack.Screen name={Paths.OTP} component={OTP} />
            <Stack.Screen
              name={Paths.ChangePassword}
              component={ChangePassword}
            />
            <Stack.Screen name={Paths.Tabs} component={BottomTabsNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
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
