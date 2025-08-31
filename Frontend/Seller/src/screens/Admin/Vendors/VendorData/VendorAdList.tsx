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
  AdminPaths.vendorAdList
>;

const AdsCard = ({ ad }: { ad: any }) => {
  const { fonts } = useTheme();

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.card}>
      <Text style={[fonts.size_16, styles.title]}>
        Ad for Product name: {ad.product.name}
      </Text>
      <Text style={fonts.size_16}>Budget: Rs. {ad.budget}</Text>
      <Text style={fonts.size_16}>Cost: Rs. {ad.cost}</Text>
      <Text style={fonts.size_16}>Clicks: {ad.clicks}</Text>
      <Text style={fonts.size_16}>Views: {ad.views}</Text>
      <Text style={[fonts.size_16]}>
        Status:{' '}
        <Text style={{ color: getStatusColor(ad.status), fontWeight: '600' }}>
          {ad.status}
        </Text>
      </Text>
      <Text style={[fonts.size_12, { marginTop: 4 }]}>
        Created: {formatDate(ad.createdAt)}
      </Text>
      <Text style={fonts.size_12}>Updated: {formatDate(ad.updatedAt)}</Text>
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return '#2ecc71';
    case 'inactive':
      return '#e67e22';
    case 'pending':
      return '#f1c40f';
    default:
      return '#95a5a6';
  }
};

const AdsPage = () => {
  const { gutters } = useTheme();
  const route = useRoute<ProductScreenProps>();
  const { ads } = route.params;
  return (
    <SafeScreen>
      <FlashList
        data={ads}
        estimatedItemSize={160}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <AdsCard ad={item} />}
        contentContainerStyle={gutters.padding_16}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeScreen>
  );
};

export default AdsPage;
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
