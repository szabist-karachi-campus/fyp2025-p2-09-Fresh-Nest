import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { usegetSubscriptions } from '@/queries/subscriptions.queries';
import { useTheme } from '@/theme';
import { SafeScreen } from '@/components/template';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { useStores } from '@/stores';
import { useNavigation } from '@react-navigation/native';

type ProfileScreenNavigationProps = StackNavigationProp<
  RootStackParamList,
  Paths.Subscriptions
>;

const FREQUENCIES = ['All', 'Daily', 'Weekly', 'Monthly'];

const Subscriptions = () => {
  const { auth } = useStores();
  const navigation = useNavigation<ProfileScreenNavigationProps>();
  const { layout, gutters, fonts, backgrounds, borders } = useTheme();
  const { data, isFetching } = usegetSubscriptions(auth.token);

  const [selectedFrequency, setSelectedFrequency] = useState('All');

  if (isFetching) {
    return (
      <SafeScreen>
        <View style={[layout.flex_1, layout.itemsCenter, layout.justifyCenter]}>
          <Text style={[fonts.size_16, fonts.gray800]}>Loading...</Text>
        </View>
      </SafeScreen>
    );
  }

  const allSubscriptions = [...(data?.subscriptions || [])].reverse();
  const subscriptions =
    selectedFrequency === 'All'
      ? allSubscriptions
      : allSubscriptions.filter(
          (subscription: any) => subscription.frequency === selectedFrequency,
        );

  return (
    <View style={[layout.flex_1, gutters.padding_16]}>
      <Text
        style={[
          fonts.size_24,
          fonts.bold,
          fonts.gray800,
          gutters.marginBottom_16,
        ]}
      >
        Your Subscriptions
      </Text>

      <View
        style={[
          layout.row,
          layout.justifyBetween,
          layout.itemsCenter,
          gutters.marginBottom_16,
        ]}
      >
        {FREQUENCIES.map((frequency) => (
          <RNBounceable
            key={frequency}
            onPress={() => setSelectedFrequency(frequency)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 6,
              borderBottomWidth: selectedFrequency === frequency ? 2 : 0,
              borderColor: '#007bff',
            }}
          >
            <Text
              style={[
                fonts.size_12,
                selectedFrequency === frequency ? fonts.bold : fonts.gray400,
              ]}
            >
              {frequency}
            </Text>
          </RNBounceable>
        ))}
      </View>

      <ScrollView>
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription: any) => (
            <RNBounceable
              onPress={() =>
                navigation.navigate(Paths.SubscriptionsDetails, {
                  id: subscription._id,
                })
              }
              key={subscription._id}
              style={[
                backgrounds.gray100,
                gutters.marginBottom_16,
                gutters.padding_12,
                borders.rounded_16,
                { elevation: 1 },
              ]}
            >
              <View
                style={[
                  layout.row,
                  layout.justifyBetween,
                  layout.itemsCenter,
                  gutters.marginBottom_12,
                ]}
              >
                <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
                  {subscription.frequency} Plan
                </Text>
                <View
                  style={{
                    backgroundColor: subscription.isActive
                      ? '#28a745'
                      : '#dc3545',
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={[
                      fonts.size_12,
                      { color: '#fff', fontWeight: 'bold' },
                    ]}
                  >
                    {subscription.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  layout.row,
                  layout.itemsCenter,
                  gutters.marginBottom_12,
                ]}
              >
                {subscription.products[0]?.product?.image?.[0] && (
                  <Image
                    source={{
                      uri: subscription.products[0].product.image[0],
                    }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      marginRight: 12,
                      backgroundColor: '#eee',
                    }}
                    resizeMode="cover"
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={[fonts.size_12, fonts.bold, fonts.gray800]}>
                    {subscription.products.length > 1
                      ? `${subscription.products[0]?.product.name || 'Product'} + ${
                          subscription.products.length - 1
                        } more`
                      : subscription.products[0]?.product?.name || 'Product'}
                  </Text>
                  <Text style={[fonts.size_12, fonts.gray400]}>
                    Rs. {subscription.products[0]?.product?.price} |{' '}
                    {subscription.products?.length} item(s)
                  </Text>
                  <Text style={[fonts.size_12, fonts.gray400]}>
                    Payment: {subscription.paymentMethod}
                  </Text>
                </View>
              </View>

              <Text style={[fonts.size_12, fonts.gray400]}>
                Next Delivery:{' '}
                {new Date(subscription.nextDeliveryDate).toLocaleDateString()}
              </Text>
            </RNBounceable>
          ))
        ) : (
          <Text
            style={[
              fonts.size_16,
              fonts.gray800,
              layout.itemsCenter,
              { textAlign: 'center', marginTop: 32 },
            ]}
          >
            No subscriptions available.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Subscriptions;
