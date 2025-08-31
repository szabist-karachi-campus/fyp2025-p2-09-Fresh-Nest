import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

type ProductScreenProps = RouteProp<
  RootStackParamList,
  AdminPaths.vendorWalletTransactions
>;

const TransactionCard = ({ txn }: { txn: any }) => {
  const { fonts } = useTheme();

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return `${date.toDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={[fonts.size_16, styles.amount]}>Rs. {txn.amount}</Text>
        <Text
          style={[
            fonts.size_16,
            {
              color: txn.transactionType === 'Credit' ? '#2ecc71' : '#e74c3c',
              fontWeight: '600',
            },
          ]}
        >
          {txn.transactionType}
        </Text>
      </View>

      <Text style={[fonts.size_16, styles.description]}>{txn.description}</Text>

      <Text style={[fonts.size_12, styles.dateText]}>
        {formatDate(txn.createdAt)}
      </Text>
    </View>
  );
};

const UserTransactions = () => {
  const { gutters } = useTheme();
  const route = useRoute<ProductScreenProps>();
  const { walletTransactions } = route.params;
  return (
    <>
      <View
        style={[
          gutters.marginTop_80,
          gutters.marginLeft_16,
          gutters.marginBottom_8,
        ]}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Transactions</Text>
      </View>
      <FlashList
        data={walletTransactions}
        estimatedItemSize={140}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TransactionCard txn={item} />}
        contentContainerStyle={gutters.padding_16}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </>
  );
};

export default UserTransactions;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontWeight: 'bold',
    color: '#34495e',
  },
  description: {
    marginTop: 8,
    color: '#555',
  },
  dateText: {
    marginTop: 8,
    color: '#888',
  },
});
