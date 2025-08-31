import 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MMKV } from 'react-native-mmkv';

import ApplicationNavigator from '@/navigation/Application';
import { ThemeProvider } from '@/theme';
import '@/translations';
import { StoresProvider } from './stores';
import { NetworkProvider } from './providers/NetworkProvider';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useEffect, useState } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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
  const fetchPublishableKey = async () => {
    setPublishableKey(
      'pk_test_51RNKsX2ff3fZ3RX22T6PFEMHQIjTXGNmG0ULqFlB7QbqPYIW2ImAl3E4WDYOOd3FX4GGn6TASjzEatluIDZ5xjnc00IveqgAPf',
    );
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);
  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={storage}>
          <NetworkProvider>
            <StoresProvider>
              <StripeProvider
                publishableKey={publishableKey}
                merchantIdentifier="merchant.identifier"
              >
                <BottomSheetModalProvider>
                  <ApplicationNavigator />
                </BottomSheetModalProvider>
              </StripeProvider>
            </StoresProvider>
          </NetworkProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
