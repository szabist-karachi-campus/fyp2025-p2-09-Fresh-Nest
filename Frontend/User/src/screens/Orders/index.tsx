import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { useGetOrders } from '@/queries/orders.queries';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { Paths } from '@/navigation/paths';
import { SafeScreen } from '@/components/template';

type OrderScreenNavigationProps = StackNavigationProp<
  RootStackParamList,
  Paths.Orders
>;

const Orders = () => {
  const navigation = useNavigation<OrderScreenNavigationProps>();
  const { layout, gutters, fonts, backgrounds, borders } = useTheme();
  const { data } = useGetOrders();

  const orders = [...(data?.orders || [])].reverse();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return '#4CAF50';
      case 'Processing':
        return '#FF9800';
      case 'Cancelled':
        return '#F44336';
      case 'Pending':
        return '#9E9E9E';
      default:
        return '#607D8B';
    }
  };

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.padding_16]}>
        <Text
          style={[
            fonts.size_24,
            fonts.bold,
            fonts.gray800,
            gutters.marginBottom_16,
          ]}
        >
          Your Orders
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {orders.length > 0 ? (
            orders.map((order: any) => (
              <RNBounceable
                onPress={() =>
                  navigation.navigate(Paths.OrderDetails, { id: order.orderNo })
                }
                key={order.orderNo}
                style={[
                  backgrounds.gray100,
                  gutters.marginBottom_16,
                  gutters.padding_12,
                  borders.rounded_16,
                  { elevation: 1 },
                ]}
              >
                {/* Header Row */}
                <View
                  style={[
                    layout.row,
                    layout.justifyBetween,
                    layout.itemsCenter,
                  ]}
                >
                  <Text style={[fonts.bold, fonts.size_16, fonts.gray800]}>
                    {order.orderNo}
                  </Text>
                  <View
                    style={{
                      backgroundColor: getStatusColor(order.status),
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
                      {order.status}
                    </Text>
                  </View>
                </View>

                {/* Body Row */}
                <View
                  style={[layout.row, layout.itemsCenter, gutters.marginTop_12]}
                >
                  {order.products[0]?.image?.[0] && (
                    <Image
                      source={{ uri: order.products[0].image[0] }}
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
                      {order.products[0]?.name || 'Product'}
                    </Text>
                    <Text style={[fonts.size_12, fonts.gray400]}>
                      Rs. {order.total} | {order.products.length} item(s)
                    </Text>
                    <Text style={[fonts.size_12, fonts.gray400]}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </RNBounceable>
            ))
          ) : (
            <Text style={[fonts.size_16, fonts.gray800, layout.itemsCenter]}>
              No orders available.
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default Orders;
