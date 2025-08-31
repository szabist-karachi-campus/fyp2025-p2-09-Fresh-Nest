import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { toast } from '@backpackapp-io/react-native-toast';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { useStores } from '@/stores';
import { Button } from '@/components/molecules';
import { useCreateSubscription } from '@/queries/subscriptions.queries';
import { Paths } from '@/navigation/paths';
import { useGetWalletBalance } from '@/queries/auth.queries';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  Paths.CreateSubscription
>;

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];
const PAYMENT_METHODS = ['Cash on Delivery', 'Cashless'];

const CreateSubscription = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cart } = useStores();
  const { layout, gutters, fonts, backgrounds, borders } = useTheme();
  const { data: walletData } = useGetWalletBalance();
  console.log(walletData?.wallet?.balance);
  const { mutateAsync } = useCreateSubscription();

  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>(
    'Weekly',
  );
  const [nextDeliveryDate, setNextDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    'Cashless' | 'Cash on Delivery'
  >('Cash on Delivery');

  const handleSubmit = async () => {
    const products = cart.cartItems.map((item: any) => ({
      product: item.id,
      quantity: item.quantity,
    }));

    if (!products.length) {
      toast.error('Your cart is empty.');
      return;
    }

    if (
      paymentMethod === 'Cashless' &&
      walletData?.wallet?.balance < cart.totalPrice()
    ) {
      toast.error('Insufficient wallet balance for cashless payment.');
      navigation.goBack();
      return;
    }

    try {
      console.log(`Trying subscription with payment method: ${paymentMethod}`);

      await mutateAsync({
        frequency,
        nextDeliveryDate: nextDeliveryDate.toISOString(),
        products,
        paymentMethod,
      });

      toast.success('Subscription created successfully!');
      cart.clearCart();
      navigation.goBack();
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={[gutters.padding_16]}>
      <View
        style={[
          backgrounds.gray100,
          gutters.padding_16,
          borders.rounded_16,
          { backgroundColor: '#fff', elevation: 2 },
        ]}
      >
        <Text
          style={[
            fonts.size_24,
            fonts.bold,
            fonts.gray800,
            gutters.marginBottom_16,
          ]}
        >
          Create Subscription
        </Text>

        {/* Frequency Selection */}
        <Text style={[fonts.size_12, fonts.gray800, gutters.marginBottom_8]}>
          Select Frequency
        </Text>
        <View
          style={[layout.row, layout.justifyBetween, gutters.marginBottom_16]}
        >
          {FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFrequency(f as typeof frequency)}
              style={{
                flex: 1,
                marginHorizontal: 4,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: f === frequency ? '#007bff' : '#ccc',
                backgroundColor: f === frequency ? '#007bff' : '#fff',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: f === frequency ? '#fff' : '#333',
                  fontWeight: 'bold',
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[fonts.size_12, fonts.gray800, gutters.marginBottom_8]}>
          Payment Method
        </Text>
        <View
          style={[layout.row, layout.justifyBetween, gutters.marginBottom_16]}
        >
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method}
              onPress={() => setPaymentMethod(method as typeof paymentMethod)}
              style={{
                flex: 1,
                marginHorizontal: 4,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: method === paymentMethod ? '#28a745' : '#ccc',
                backgroundColor: method === paymentMethod ? '#28a745' : '#fff',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  color: method === paymentMethod ? '#fff' : '#333',
                  fontWeight: 'bold',
                }}
              >
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[fonts.size_12, fonts.gray800, gutters.marginBottom_8]}>
          Next Delivery Date
        </Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <Text>{nextDeliveryDate.toDateString()}</Text>
        </TouchableOpacity>

        <DatePicker
          modal
          mode="date"
          open={showDatePicker}
          date={nextDeliveryDate}
          minimumDate={new Date()}
          onConfirm={(date) => {
            setShowDatePicker(false);
            setNextDeliveryDate(date);
          }}
          onCancel={() => {
            setShowDatePicker(false);
          }}
        />

        {/* Product Summary */}
        <Text
          style={[
            fonts.size_16,
            fonts.bold,
            fonts.gray800,
            gutters.marginBottom_12,
          ]}
        >
          Products
        </Text>
        {cart.cartItems.map((item: any, idx: number) => (
          <View
            key={item.id + idx}
            style={[
              layout.row,
              layout.itemsCenter,
              gutters.marginBottom_12,
              {
                backgroundColor: '#f9f9f9',
                padding: 10,
                borderRadius: 12,
              },
            ]}
          >
            <Image
              source={{ uri: item.image }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                marginRight: 12,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
                {item.name}
              </Text>
              <Text style={[fonts.size_12, fonts.gray800]}>
                Rs. {item.price} x {item.quantity}
              </Text>
            </View>
          </View>
        ))}

        <View
          style={[
            layout.row,
            layout.justifyBetween,
            gutters.marginBottom_16,
            {
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: '#ccc',
            },
          ]}
        >
          <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
            Total Amount
          </Text>
          <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
            Rs. {cart.totalPrice()}
          </Text>
        </View>

        <Button label="Confirm Subscription" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

export default CreateSubscription;
