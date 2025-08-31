import RNBounceable from '@freakycoder/react-native-bounceable';
import { toast } from '@backpackapp-io/react-native-toast';
import DropDownPicker from 'react-native-dropdown-picker';
import { useCreateOrder } from '@/queries/orders.queries';
import { Button, Input } from '@/components/molecules';
import { useAddAddress } from '@/queries/auth.queries';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useRef, useState } from 'react';
import { useStores } from '@/stores';
import { useTheme } from '@/theme';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useStripe } from '@stripe/stripe-react-native';
import { useCreatePaymentIntent } from '@/queries/payment.queries';

type CheckoutScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.Checkout
>;

const Checkout = observer(() => {
  const { layout, gutters, navigationTheme, fonts, backgrounds, borders } =
    useTheme();
  const { t } = useTranslation();

  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { user, cart, auth } = useStores();

  const [editingAddress, setEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { mutateAsync: paymentIntent } = useCreatePaymentIntent();
  const [open, setOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const onSubmit = async (data: { amount: string }) => {
    const amount = parseInt(data.amount, 10);

    if (isNaN(amount)) return;

    try {
      // Step 1: Create PaymentIntent
      try {
        const productArray = cart.cartItems.map((item) => item.id);
        const quantityArray = cart.cartItems.map((item) => item.quantity);
        const createdOrder = await createOrder({
          products: productArray,
          quantities: quantityArray,
          total: calculateTotal(),
          paymentMethod: paymentMethod,
        });

        const response = await paymentIntent({
          token: auth.token,
          amount: amount * 100,
          orderNo: createdOrder.data.orders[0].orderNo,
        });

        console.log('Payment Intent Response:', response);

        if (!response?.data?.clientSecret) {
          console.error('No client secret received');
          return;
        }
        bottomSheetRef.current?.close();

        // Step 2: Initialize Stripe Payment Sheet
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'FreshNest Inc.',
          paymentIntentClientSecret: response.data.clientSecret,
        });

        if (initError) {
          console.error('Error initializing payment sheet:', initError);
          return;
        }

        // Step 3: Present Payment Sheet
        const { error } = await presentPaymentSheet();

        if (error) {
          console.log('Payment failed:', error.message);
        } else {
          console.log('Payment succeeded!');
          cart.clearCart();
          toast.success('Order placed successfully!');
          navigation.goBack();
          navigation.navigate(Paths.HomeStack, {
            screen: Paths.Home,
          });
          closeSheet();
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while placing orders.');
      }
    } catch (err) {
      console.error('Error during payment process:', err);
    }
  };

  const addressFields: Fields[] = [
    {
      name: 'address',
      type: 'text',
      placeholder: 'Address',
      key: 'address',
      keyboardType: 'default',
    },
    {
      name: 'city',
      type: 'text',
      placeholder: 'City',
      key: 'city',
      keyboardType: 'default',
    },
    {
      name: 'state',
      type: 'text',
      placeholder: 'State',
      key: 'state',
      keyboardType: 'default',
    },
    {
      name: 'postalcode',
      type: 'number',
      placeholder: 'Postal Code',
      key: 'postalcode',
      keyboardType: 'phone-pad',
    },
  ];

  const validationAddressSchema = Yup.object({
    address: Yup.string()
      .trim()
      .required(t('address_error'))
      .min(5, 'Address must be at least 5 characters long.')
      .max(100, 'Address cannot exceed 100 characters.'),
    city: Yup.string()
      .trim()
      .required(t('city_error'))
      .matches(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces.'),
    state: Yup.string()
      .trim()
      .required(t('state_error'))
      .matches(/^[a-zA-Z\s]+$/, 'State can only contain letters and spaces.'),
    postalcode: Yup.string()
      .trim()
      .required(t('postal_code_error'))
      .matches(/^\d{5}$/, t('postal_code_format_error')),
    amount: Yup.string()
      .required('Amount is required')
      .matches(/^[1-9][0-9]*$/, 'Enter a valid whole number greater than 0'),
  });
  const calculateTotal = () =>
    cart.cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: '',
      city: '',
      state: '',
      postalcode: '',
      amount: String(calculateTotal()),
    },
    resolver: yupResolver(validationAddressSchema),
    mode: 'onChange',
  });

  const { mutateAsync } = useAddAddress();

  const onAddressSubmit = handleSubmit(async (data: addAddressRequest) => {
    setLoading(true);
    try {
      const response = await mutateAsync({
        address: data.address,
        city: data.city,
        state: data.state,
        postalcode: data.postalcode,
      });

      if (response.data.success === true) {
        toast.success(response.data.message);
        user.setMany({
          address: response.data.user.address,
          city: response.data.user.city,
          state: response.data.user.state,
          postalcode: response.data.user.postalcode,
        });

        setEditingAddress(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(
        error.message || 'An error occurred while submitting the address',
      );
    } finally {
      setLoading(false);
    }
  });

  const { mutateAsync: createOrder } = useCreateOrder();

  const onCheckout = async () => {
    setLoading(true);
    if (paymentMethod === 'Cashless') {
      await onSubmit({ amount: calculateTotal().toString() });
    } else {
      const productArray = cart.cartItems.map((item) => item.id);
      const quantityArray = cart.cartItems.map((item) => item.quantity);
      await createOrder({
        products: productArray,
        quantities: quantityArray,
        total: calculateTotal(),
        paymentMethod: paymentMethod,
      });
      cart.clearCart();
      navigation.goBack();
      navigation.navigate(Paths.HomeStack, {
        screen: Paths.Home,
      });
      toast.success('Order placed successfully!');
      setLoading(false);
    }
  };

  const renderCartItem = ({
    item,
  }: {
    item: { name: string; quantity: number; price: number };
  }) => (
    <View
      style={[
        layout.row,
        layout.itemsCenter,
        layout.justifyBetween,
        gutters.marginBottom_12,
        gutters.padding_12,
        backgrounds.gray100,
        borders.rounded_16,
      ]}
    >
      <Text style={[fonts.size_16, fonts.gray800]}>
        {item.name} x {item.quantity}
      </Text>
      <Text style={[fonts.size_16, fonts.gray800]}>
        Rs. {item.price * item.quantity}
      </Text>
    </View>
  );

  return (
    <View style={[layout.flex_1, gutters.padding_16]}>
      <Text
        style={[
          fonts.bold,
          fonts.size_16,
          fonts.gray800,
          gutters.marginBottom_12,
        ]}
      >
        {t('checkout.contact_details')}
      </Text>
      <View
        style={[
          backgrounds.gray100,
          borders.rounded_16,
          gutters.padding_16,
          gutters.marginBottom_16,
        ]}
      >
        <Text style={[fonts.size_12, fonts.gray800, gutters.marginBottom_8]}>
          {t('checkout.name_label')}: {user.name}
        </Text>
        <View style={[layout.row, layout.justifyBetween]}>
          <Text style={[fonts.size_12, fonts.gray800]}>
            {t('checkout.email_label')}: {user.email}
          </Text>
          <Text style={[fonts.size_12, fonts.gray800]}>
            {t('checkout.phone_label')}: {user.phone}
          </Text>
        </View>
      </View>

      <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
        {t('checkout.shipping_address')}
      </Text>

      {!editingAddress ? (
        <View
          style={[
            backgrounds.gray100,
            borders.rounded_16,
            gutters.marginTop_8,
            gutters.padding_12,
          ]}
        >
          <Text style={[fonts.size_12, fonts.gray800]}>{user.address}</Text>
          <Text style={[fonts.size_12, fonts.gray800]}>
            {user.city}, {user.state}, {user.postalcode}
          </Text>
          <RNBounceable onPress={() => setEditingAddress(true)}>
            <Text
              style={[
                fonts.bold,
                fonts.size_12,
                fonts.gray800,
                { textAlign: 'right' },
              ]}
            >
              {t('checkout.edit_address')}
            </Text>
          </RNBounceable>
        </View>
      ) : (
        <View style={[layout.col, gutters.marginTop_16]}>
          {addressFields.map((field) => {
            return (
              <Controller
                key={field.key}
                control={control}
                name={field.key as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    error={
                      errors[
                        field.key as 'address' | 'city' | 'state' | 'postalcode'
                      ]?.message
                    }
                    handleChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    key={field.key}
                    keyboardType={
                      field.keyboardType ? field.keyboardType : 'default'
                    }
                    placeholder={field.placeholder}
                  />
                )}
              />
            );
          })}

          <Button
            label={t('checkout.submit_address_button')}
            loading={loading}
            onPress={onAddressSubmit}
          />
        </View>
      )}

      <Text
        style={[fonts.bold, fonts.size_16, fonts.gray800, gutters.marginTop_16]}
      >
        {t('checkout.payment_method')}
      </Text>

      <DropDownPicker
        items={[
          { label: t('checkout.cash_on_delivery'), value: 'Cash on Delivery' },
          {
            label: t('checkout.payfast_method'),
            value: 'Cashless',
          },
        ]}
        value={paymentMethod}
        multiple={false}
        containerStyle={[gutters.marginTop_12, backgrounds.gray100]}
        style={[backgrounds.gray100]}
        textStyle={[fonts.gray800]}
        dropDownContainerStyle={backgrounds.gray100}
        setValue={setPaymentMethod}
        open={open}
        setOpen={setOpen}
      />

      <Text
        style={[
          fonts.bold,
          fonts.size_16,
          fonts.gray800,
          gutters.marginTop_24,
          gutters.marginBottom_12,
        ]}
      >
        {t('checkout.order_summary')}
      </Text>
      <FlatList
        data={cart.cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
      />

      <View
        style={[
          layout.row,
          layout.itemsCenter,
          layout.justifyBetween,
          gutters.marginTop_16,
          borders.wTop_2,
          borders.gray200,
          gutters.paddingVertical_24,
        ]}
      >
        <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>Total</Text>
        <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
          Rs. {calculateTotal()}
        </Text>
      </View>

      <Button
        label={
          paymentMethod === 'Cash on Delivery'
            ? 'Confirm Order'
            : 'Proceed to Payment'
        }
        onPress={onCheckout}
      />
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        backgroundStyle={{ backgroundColor: navigationTheme.colors.border }}
        handleIndicatorStyle={backgrounds.gray800}
        enablePanDownToClose={true}
        snapPoints={['50%']}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={{ flex: 1, paddingHorizontal: '5%' }}>
            <Text
              style={[
                fonts.bold,
                fonts.gray800,
                gutters.marginBottom_16,
                fonts.size_24,
                {},
              ]}
            >
              Top Up Wallet
            </Text>

            <Text style={[gutters.marginTop_12, fonts.gray800, fonts.bold]}>
              Select Amount
            </Text>

            <View style={[layout.row, layout.justifyBetween, layout.wrap]}>
              {[1000, 5000, 10000, 50000].map((amount) => (
                <RNBounceable
                  onPress={() => setValue('amount', String(amount))}
                  key={amount}
                  style={[
                    gutters.padding_12,
                    borders.rounded_16,
                    layout.itemsCenter,
                    gutters.marginTop_24,
                    {
                      backgroundColor: 'tomato',
                      minWidth: 70,
                    },
                  ]}
                >
                  <Text style={[fonts.bold, { color: 'white' }]}>
                    PKR {amount}
                  </Text>
                </RNBounceable>
              ))}
            </View>

            <Text
              style={[
                gutters.marginTop_16,
                gutters.marginBottom_12,
                fonts.bold,
                fonts.gray800,
              ]}
            >
              Or Enter Amount
            </Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Enter custom amount"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  style={[
                    borders.w_1,
                    borders.rounded_4,
                    fonts.gray800,
                    gutters.padding_12,
                    gutters.marginTop_12,
                    {
                      borderColor: errors.amount ? 'red' : 'tomato',
                    },
                  ]}
                />
              )}
            />
            {errors.amount && (
              <Text style={[gutters.marginTop_12, { color: 'red' }]}>
                {errors.amount.message}
              </Text>
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
});

export default Checkout;

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    width: 200,
    height: 50,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetContent: {
    flex: 1,
  },
  closeButton: {
    marginTop: 20,
  },
});
