import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import { SafeScreen } from '@/components/templates';

type ProductScreenProps = RouteProp<
  RootStackParamList,
  AdminPaths.vendorSubcriptionList
>;

const SubscriptionCard = ({ sub }: { sub: any }) => {
  const { fonts } = useTheme();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toDateString();
  };

  return (
    <View style={styles.card}>
      <Text style={[fonts.size_16, styles.title]}>
        {sub.frequency} Subscription
      </Text>
      <Text style={fonts.size_16}>
        Next Delivery: {formatDate(sub.nextDeliveryDate)}
      </Text>
      <Text style={fonts.size_16}>Payment: {sub.paymentMethod}</Text>
      <Text style={fonts.size_16}>
        Active:{' '}
        <Text
          style={{
            fontWeight: '600',
            color: sub.isActive ? '#2ecc71' : '#e74c3c',
          }}
        >
          {sub.isActive ? 'Yes' : 'No'}
        </Text>
      </Text>
      <View style={{ marginTop: 8 }}>
        <Text style={[fonts.size_16, { fontWeight: 'bold' }]}>Products:</Text>
        {sub.products.map((p: any) => (
          <Text key={p._id} style={fonts.size_16}>
            • {p.product.name} - Qty: {p.quantity}
          </Text>
        ))}
      </View>
    </View>
  );
};

const SubscriptionPage = () => {
  const { gutters } = useTheme();
  const route = useRoute<ProductScreenProps>();
  const { subscriptions } = route.params;
  return (
    <SafeScreen>
      <FlashList
        data={subscriptions}
        estimatedItemSize={180}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <SubscriptionCard sub={item} />}
        contentContainerStyle={gutters.padding_16}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeScreen>
  );
};

export default SubscriptionPage;

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
    marginBottom: 6,
  },
});
