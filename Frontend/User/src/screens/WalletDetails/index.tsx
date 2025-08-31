import { View, Text, TextInput } from 'react-native';
import React, { useRef } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import {
  useGetWalletBalance,
  useGetWalletTransactions,
} from '@/queries/auth.queries';
import { usetopUpWallet } from '@/queries/payment.queries';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/template';
import { FlashList } from '@shopify/flash-list';

import * as Icons from '@/components/molecules/icons';

import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import RNBounceable from '@freakycoder/react-native-bounceable';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useStripe } from '@stripe/stripe-react-native';
import { toast } from '@backpackapp-io/react-native-toast';

type ScreenProps = RouteProp<RootStackParamList, Paths.WalletDetails>;

const WalletDetails = () => {
  const { id } = useRoute<ScreenProps>().params;
  const navigation = useNavigation();
  const { mutateAsync: TopUpWallet } = usetopUpWallet();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { data, isLoading, isError } = useGetWalletTransactions(id);
  const { data: walletData, isLoading: balanceLoading } = useGetWalletBalance();
  const { layout, gutters, fonts, backgrounds, borders, variant } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const transactions = data?.transactions || [];
  const balance = walletData?.wallet?.balance;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
    },
    resolver: yupResolver(
      Yup.object({
        amount: Yup.string()
          .required('Amount is required')
          .matches(/^[1-9]\d*$/, 'Enter a valid amount')
          .test(
            'min',
            'You should topup atleast Rs.500',
            (value) => parseInt(value, 10) >= 500,
          ),
      }),
    ),
  });

  const handleTopUpSubmit = async (data: { amount: string }) => {
    const amount = parseInt(data.amount);

    try {
      const response = await TopUpWallet(amount);
      const clientSecret = response?.clientSecret;

      if (!clientSecret) {
        console.error('No client secret returned from top-up');
        return;
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'FreshNest Inc.',
        paymentIntentClientSecret: clientSecret,
      });

      if (initError) {
        console.error('Stripe init error:', initError.message);
        return;
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error('Top-up failed:', paymentError.message);
        toast.error('Top-up failed: ' + paymentError.message);
      } else {
        toast.success('Wallet topped up successfully!');
        setValue('amount', '');
        bottomSheetRef.current?.close();
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Top-up process failed:', error.message || error);
      toast.error('Top-up failed: ' + (error.message || 'Unknown error'));
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || balanceLoading) {
    return (
      <SafeScreen>
        <View style={[layout.itemsCenter]}>
          <Text style={[fonts.size_16, fonts.gray800]}>Loading...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (isError) {
    return (
      <SafeScreen>
        <View style={[layout.itemsCenter]}>
          <Text style={[fonts.size_16, fonts.red500]}>
            Failed to load transactions.
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.padding_16]}>
        <View style={[borders.rounded_16, gutters.padding_24]}>
          <Text
            style={[
              fonts.size_24,
              fonts.bold,
              fonts.alignCenter,
              fonts.gray800,
              gutters.marginBottom_16,
            ]}
          >
            Current Balance
          </Text>
          <Text style={[fonts.size_12, fonts.bold, fonts.alignCenter]}>
            PKR
          </Text>
          <Text
            style={[
              fonts.size_40,
              fonts.bold,
              fonts.alignCenter,
              { color: 'green' },
            ]}
          >
            {balance}
          </Text>
        </View>

        <View
          style={[layout.row, layout.justifyAround, gutters.marginBottom_24]}
        >
          <RNBounceable
            onPress={() => bottomSheetRef.current?.expand()}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#28a745',
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            }}
          >
            <View>
              <Icons.FontAwesome5 name="wallet" size={25} color={'#fff'} />
              <Icons.FontAwesome5
                name="plus-circle"
                size={20}
                color={variant === 'dark' ? '#fff' : '#000'}
                style={{ position: 'absolute', right: -30, bottom: -20 }}
              />
            </View>
          </RNBounceable>
        </View>

        <Text
          style={[
            fonts.size_24,
            fonts.bold,
            fonts.alignCenter,
            fonts.gray800,
            gutters.marginBottom_16,
          ]}
        >
          Wallet Transactions
        </Text>

        {transactions.length > 0 ? (
          <FlashList
            data={transactions}
            keyExtractor={(item: any) => item._id}
            estimatedItemSize={100}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={[
                  backgrounds.gray100,
                  borders.rounded_16,
                  gutters.padding_16,
                  gutters.marginBottom_12,
                  { elevation: 2 },
                ]}
              >
                <Text
                  style={[fonts.size_12, fonts.gray800, gutters.marginBottom_8]}
                >
                  {item.description}
                </Text>

                <View
                  style={[
                    layout.row,
                    layout.justifyBetween,
                    layout.itemsCenter,
                  ]}
                >
                  <Text
                    style={[
                      fonts.size_16,
                      item.transactionType === 'Credit'
                        ? { color: 'green' }
                        : { color: 'red' },
                      fonts.bold,
                    ]}
                  >
                    {item.transactionType === 'Credit' ? '+' : '-'} PKR{' '}
                    {item.amount}
                  </Text>
                  <Text style={[fonts.size_12, fonts.gray400]}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={[fonts.size_16, fonts.gray800]}>
            No transactions found.
          </Text>
        )}
      </View>
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        snapPoints={['45%']}
        enablePanDownToClose
      >
        <BottomSheetView
          style={[
            layout.flex_1,
            backgrounds.gray100,
            gutters.paddingHorizontal_16,
            gutters.paddingTop_16,
          ]}
        >
          <Text style={[fonts.bold, fonts.gray800, fonts.size_24]}>
            Top Up Wallet
          </Text>

          <View style={[layout.row, layout.justifyBetween, layout.wrap]}>
            {[1000, 5000, 10000, 50000].map((amount) => (
              <RNBounceable
                key={amount}
                onPress={() => setValue('amount', String(amount))}
                style={[
                  gutters.padding_12,
                  borders.rounded_4,
                  gutters.marginTop_16,
                  {
                    backgroundColor: '#28a745',
                    minWidth: 120,
                  },
                ]}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                  PKR {amount}
                </Text>
              </RNBounceable>
            ))}
          </View>

          <Text style={[fonts.gray800, gutters.marginTop_16]}>
            Or enter custom amount
          </Text>

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                keyboardType="numeric"
                placeholder="Enter amount"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                style={[
                  gutters.marginTop_12,
                  gutters.padding_12,
                  borders.rounded_16,
                  {
                    borderWidth: 1,
                    borderColor: errors.amount ? 'red' : 'gray',
                    color: '#000',
                  },
                ]}
              />
            )}
          />
          {errors.amount && (
            <Text style={{ color: 'red', marginTop: 8 }}>
              {errors.amount.message}
            </Text>
          )}

          <RNBounceable
            onPress={handleSubmit(handleTopUpSubmit)}
            style={[
              gutters.marginTop_24,
              {
                backgroundColor: 'tomato',
                paddingVertical: 12,
                borderRadius: 8,
              },
            ]}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Top Up</Text>
          </RNBounceable>
        </BottomSheetView>
      </BottomSheet>
    </SafeScreen>
  );
};

export default WalletDetails;
