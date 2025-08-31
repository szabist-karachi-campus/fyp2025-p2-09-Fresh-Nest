import RNBounceable from '@freakycoder/react-native-bounceable';
import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { FontAwesome5 } from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

type ProductScreenProps = RouteProp<
  RootStackParamList,
  AdminPaths.VendorOrderList
>;

const OrderCard = ({ order }: { order: any }) => {
  const { fonts } = useTheme();

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  return (
    <View style={styles.card}>
      <Text style={[fonts.size_16, styles.title]}>
        Order No: {order.orderNo || order._id}
      </Text>
      <Text style={[fonts.size_16]}>Total: Rs. {order.total}</Text>
      <Text style={[fonts.size_16]}>
        Status:{' '}
        <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
          {order.status}
        </Text>
      </Text>
      <Text style={[fonts.size_16]}>
        Payment: {order.paymentStatus} ({order.paymentMethod})
      </Text>
      <Text style={[fonts.size_12, { marginTop: 4 }]}>
        {formatDate(order.createdAt)}
      </Text>
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'cancelled':
      return '#e74c3c';
    case 'pending':
      return '#f1c40f';
    case 'completed':
    case 'delivered':
      return '#2ecc71';
    default:
      return '#3498db';
  }
};

const OrdersPage = () => {
  const { layout, borders, backgrounds, fonts, variant, gutters } = useTheme();
  const route = useRoute<ProductScreenProps>();
  const { orders } = route.params;
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((item) => {
    return item.orderNo?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeScreen>
      <View
        style={[
          layout.row,
          layout.itemsCenter,
          layout.justifyBetween,
          gutters.marginBottom_12,
          gutters.marginHorizontal_16,
        ]}
      >
        <TextInput
          style={[
            borders.rounded_16,
            backgrounds.gray100,
            gutters.padding_12,
            fonts.size_16,
            fonts.gray800,
            gutters.marginTop_12,
            gutters.marginRight_12,
            { width: '85%', color: variant === 'dark' ? '#fff' : '#000' },
          ]}
          placeholder={'Search Order No...'}
          placeholderTextColor={variant === 'dark' ? '#fff' : '#000'}
          value={search}
          onChangeText={(text) => setSearch(text)}
        />
        <RNBounceable
          style={[
            borders.rounded_16,
            backgrounds.gray100,
            gutters.padding_12,
            gutters.marginTop_12,
          ]}
        >
          <FontAwesome5
            name="search"
            size={20}
            color={variant === 'dark' ? '#fff' : '#000'}
          />
        </RNBounceable>
      </View>
      <FlashList
        data={filteredOrders}
        estimatedItemSize={160}
        contentContainerStyle={gutters.padding_16}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OrderCard order={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeScreen>
  );
};

export default OrdersPage;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
