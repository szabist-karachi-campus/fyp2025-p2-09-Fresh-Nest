import 'react-native-gesture-handler';

import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MMKV } from 'react-native-mmkv';

import { ThemeProvider } from '@/theme';
import ApplicationNavigator from '@/navigation/Application';

import '@/translations';

import messaging from '@react-native-firebase/messaging';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { StoresProvider, useStores } from './stores';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});

export const storage = new MMKV();

function App() {
  const [publishableKey, setPublishableKey] = useState('');
  const { auth } = useStores();
  const fetchPublishableKey = async () => {
    setPublishableKey(
      'pk_test_51RNKsX2ff3fZ3RX22T6PFEMHQIjTXGNmG0ULqFlB7QbqPYIW2ImAl3E4WDYOOd3FX4GGn6TASjzEatluIDZ5xjnc00IveqgAPf',
    );
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('User declined notification permissions');
      }
    };

    const getDeviceToken = async () => {
      try {
        const token = await messaging().getToken();
        auth.set('deviceToken', token);
        console.log('Device Token:', token);
      } catch (error) {
        console.error('Failed to get device token:', error);
      }
    };

    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage) => {
        console.log('Foreground Notification:', remoteMessage);
        Alert.alert(
          remoteMessage.notification?.title || 'Notification',
          remoteMessage.notification?.body || 'No message body',
        );
      },
    );

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background Notification:', remoteMessage);
    });

    requestNotificationPermission();
    getDeviceToken();

    return () => {
      unsubscribeForeground();
    };
  }, []);
  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={storage}>
          <StoresProvider>
            <StripeProvider
              publishableKey={publishableKey}
              merchantIdentifier="merchant.identifier"
            >
              <ApplicationNavigator />
            </StripeProvider>
          </StoresProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
