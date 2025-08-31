import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  usegetSubscriptions,
  useUpdateSubscription,
  useCancelSubscription,
} from '@/queries/subscriptions.queries';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/template';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useStores } from '@/stores';
import DatePicker from 'react-native-date-picker';
import { toast } from '@backpackapp-io/react-native-toast';
import RNBounceable from '@freakycoder/react-native-bounceable';

type ScreenProps = RouteProp<RootStackParamList, Paths.SubscriptionsDetails>;

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

const SubscriptionsDetails = () => {
  const { auth } = useStores();
  const { layout, gutters, fonts, backgrounds, borders } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ScreenProps>();
  const { id } = route.params;

  const { data, isFetching } = usegetSubscriptions(auth.token);
  const { mutateAsync: updateSubscription } = useUpdateSubscription();
  const { mutateAsync: cancelSubscription } = useCancelSubscription();

  const subscription = data?.subscriptions?.find((sub: any) => sub._id === id);

  const [frequency, setFrequency] = useState<
    'Daily' | 'Weekly' | 'Monthly' | 'daily' | 'weekly' | 'monthly' | undefined
  >(undefined);
  const [nextDeliveryDate, setNextDeliveryDate] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(() => {
    if (subscription) {
      setFrequency(subscription.frequency);
      setNextDeliveryDate(new Date(subscription.nextDeliveryDate));
      setIsActive(subscription.isActive);
    }
  }, [subscription]);

  const handleUpdate = async () => {
    try {
      await updateSubscription({
        id: subscription._id,
        values: {
          frequency,
          nextDeliveryDate: nextDeliveryDate.toISOString(),
          isActive,
        },
      });
      toast.success('Subscription updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong while updating');
    }
  };

  const handleCancel = async () => {
    try {
      Alert.alert(
        'Cancel Subscription',
        'Are you sure you want to cancel this subscription?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              await cancelSubscription(subscription._id);
              toast.success('Subscription cancelled successfully');
              navigation.goBack();
            },
          },
        ],
        { cancelable: true },
      );
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong while cancelling');
    }
  };

  if (isFetching || !subscription) {
    return (
      <SafeScreen>
        <View style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}>
          <Text style={[fonts.size_16, fonts.gray800]}>
            {isFetching ? 'Loading...' : 'Subscription not found.'}
          </Text>
        </View>
      </SafeScreen>
    );
  }

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
          Edit Subscription
        </Text>

        <Text style={[fonts.size_12, fonts.gray400, gutters.marginBottom_8]}>
          Frequency
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            marginBottom: 16,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() =>
                  setFrequency(
                    f as
                      | 'Daily'
                      | 'Weekly'
                      | 'Monthly'
                      | 'daily'
                      | 'weekly'
                      | 'monthly',
                  )
                }
                style={{ flex: 1, alignItems: 'center' }}
              >
                <View
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: f === frequency ? '#007bff' : '#333',
                      fontWeight: f === frequency ? 'bold' : 'normal',
                    }}
                  >
                    {f}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View
          style={[
            layout.row,
            layout.justifyBetween,
            layout.itemsCenter,
            gutters.marginBottom_16,
            {
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ccc',
            },
          ]}
        >
          <Text style={[fonts.size_12, fonts.gray800]}>
            Active Subscription
          </Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[fonts.size_12, fonts.gray800, gutters.marginBottom_8]}>
            Next Delivery Date
          </Text>
          <RNBounceable
            onPress={() => {
              setShowDatePicker(true);
            }}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Text>{nextDeliveryDate.toDateString()}</Text>
          </RNBounceable>
        </View>

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
        {subscription.products.map((item: any, index: number) => (
          <View
            key={item?.product?._id + index}
            style={[
              layout.row,
              layout.itemsCenter,
              gutters.marginBottom_12,
              {
                backgroundColor: '#f9f9f9',
                padding: 12,
                borderRadius: 12,
              },
            ]}
          >
            {item.product?.image?.[0] && (
              <Image
                source={{ uri: item.product.image[0] }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  marginRight: 12,
                  backgroundColor: '#eee',
                }}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[fonts.size_16, fonts.bold, fonts.gray800]}>
                {item?.product?.name}
              </Text>
              <Text style={[fonts.size_16, fonts.gray400]}>
                Rs. {item?.product?.price}
              </Text>
            </View>
          </View>
        ))}

        <RNBounceable
          onPress={handleUpdate}
          style={{
            backgroundColor: '#007bff',
            padding: 14,
            borderRadius: 10,
            marginTop: 24,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            Update Subscription
          </Text>
        </RNBounceable>
      </View>
      <DatePicker
        modal
        mode="date"
        open={showDatePicker}
        date={nextDeliveryDate}
        minimumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          console.log('Selected date:', date);
          setNextDeliveryDate(date);
        }}
        onCancel={() => {
          setShowDatePicker(false);
        }}
      />
      <RNBounceable
        onPress={handleCancel}
        style={{
          backgroundColor: '#ff4d4d',
          padding: 14,
          borderRadius: 10,
          marginTop: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          Cancel Subscription
        </Text>
      </RNBounceable>
    </ScrollView>
  );
};

export default SubscriptionsDetails;
