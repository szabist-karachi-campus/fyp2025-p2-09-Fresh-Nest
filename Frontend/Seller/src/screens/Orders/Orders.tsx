import RNBounceable from '@freakycoder/react-native-bounceable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { TabPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { SafeScreen } from '@/components/templates';

import { useGetOrders } from '@/queries/orders.queries';

type NavigationProps = StackNavigationProp<RootStackParamList>;

const VendorOrders = () => {
  const navigation = useNavigation<NavigationProps>();
  const { layout, gutters, fonts, backgrounds, borders } = useTheme();
  const { data } = useGetOrders();
  const orderData = data?.orders || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#28a745';
      case 'processing':
        return '#fd7e14';
      case 'cancelled':
        return '#dc3545';
      case 'pending':
        return '#6c757d';
      default:
        return '#000';
    }
  };

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.marginHorizontal_16]}>
        <Text
          style={[
            fonts.bold,
            fonts.size_24,
            fonts.gray800,
            gutters.marginBottom_24,
          ]}
        >
          Vendor Orders
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {orderData.length > 0 ? (
            orderData.map((order: any) => (
              <RNBounceable
                key={order._id}
                onPress={() =>
                  navigation.navigate(TabPaths.OrderDetails, { id: order._id })
                }
                style={[
                  backgrounds.gray100,
                  borders.rounded_16,
                  gutters.padding_16,
                  gutters.marginBottom_16,
                ]}
              >
                {/* Header: Order ID and Date */}
                <View
                  style={[
                    layout.row,
                    layout.justifyBetween,
                    gutters.marginBottom_8,
                  ]}
                >
                  <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
                    Order No: {order.orderNo}
                  </Text>
                  <Text style={[fonts.size_12, fonts.gray400]}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {order.products[0] && (
                  <View
                    style={[
                      layout.row,
                      layout.itemsCenter,
                      gutters.marginBottom_12,
                    ]}
                  >
                    <Image
                      source={{ uri: order.products[0]?.image?.[0] }}
                      style={[
                        borders.rounded_4,
                        { width: 60, height: 60, marginRight: 12 },
                      ]}
                      resizeMode="cover"
                    />
                    <View style={layout.flex_1}>
                      <Text style={[fonts.size_12, fonts.gray800, fonts.bold]}>
                        {order.products[0].name}
                      </Text>
                      <Text style={[fonts.size_12, fonts.gray400]}>
                        +{order.products.length - 1} other item(s)
                      </Text>
                    </View>
                  </View>
                )}

                {/* Order Details */}
                <View style={[gutters.marginBottom_12]}>
                  <Text style={[fonts.size_12, fonts.gray800]}>
                    Total: <Text style={fonts.bold}>Rs. {order.total}</Text>
                  </Text>
                  <Text style={[fonts.size_12, fonts.gray800]}>
                    <Text style={fonts.bold}>
                      Payment: {order.paymentMethod}
                    </Text>
                  </Text>
                  <Text style={[fonts.size_12, fonts.gray800]}>
                    <Text style={fonts.bold}>
                      Status: {order.paymentStatus}
                    </Text>
                  </Text>
                </View>

                <View
                  style={[layout.row, layout.justifyEnd, layout.itemsCenter]}
                >
                  <Text
                    style={[
                      fonts.bold,
                      fonts.size_12,
                      {
                        color: getStatusColor(order.status),
                        textTransform: 'capitalize',
                      },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </RNBounceable>
            ))
          ) : (
            <Text style={[fonts.size_16, fonts.alignCenter, fonts.gray800]}>
              No orders available.
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default VendorOrders;
