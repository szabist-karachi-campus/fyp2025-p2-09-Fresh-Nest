import RNBounceable from '@freakycoder/react-native-bounceable';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import { useGetDeletedVendors } from '@/queries/super.queries';

const DeletedVendors = () => {
  const { layout, gutters, fonts, borders } = useTheme();
  const { data } = useGetDeletedVendors();

  const renderDeletedVendor = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const wallet = data?.wallets?.[index];
    const balance = wallet?.balance ?? 0;

    return (
      <RNBounceable
        key={item._id}
        style={[
          gutters.padding_16,
          gutters.marginBottom_12,
          borders.rounded_16,
          {
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
      >
        <Text style={[fonts.size_24, fonts.bold, fonts.gray800]}>
          {item.name}
        </Text>

        <View style={[layout.row, layout.itemsCenter, gutters.marginTop_8]}>
          <Icons.MaterialIcons name="email" size={16} color="#6b7280" />
          <Text style={[fonts.size_16, fonts.gray800, gutters.marginLeft_8]}>
            {item.email}
          </Text>
        </View>

        <View style={[layout.row, layout.itemsCenter, gutters.marginTop_8]}>
          <Icons.Feather name="phone" size={16} color="#6b7280" />
          <Text style={[fonts.size_16, fonts.gray800, gutters.marginLeft_8]}>
            {item.phone}
          </Text>
        </View>

        <View style={[layout.row, layout.itemsCenter, gutters.marginTop_8]}>
          <Icons.FontAwesome5 name="id-card" size={16} color="#6b7280" />
          <Text style={[fonts.size_16, fonts.gray800, gutters.marginLeft_8]}>
            CNIC: {item.cnic}
          </Text>
        </View>

        <View style={[layout.row, layout.itemsCenter, gutters.marginTop_8]}>
          <Icons.FontAwesome5 name="user" size={16} color="#6b7280" />
          <Text style={[fonts.size_16, fonts.gray800, gutters.marginLeft_8]}>
            Deleted ID: {item.deletedId}
          </Text>
        </View>

        <View style={[layout.row, layout.itemsCenter, gutters.marginTop_8]}>
          <Icons.FontAwesome5 name="wallet" size={16} color="#6b7280" />
          <Text style={[fonts.size_16, fonts.gray800, gutters.marginLeft_8]}>
            Wallet Balance: Rs. {balance}
          </Text>
        </View>
      </RNBounceable>
    );
  };

  return (
    <SafeScreen>
      <View style={[layout.flex_1, gutters.padding_16]}>
        <Text
          style={[
            fonts.bold,
            fonts.size_24,
            fonts.gray800,
            gutters.marginBottom_24,
          ]}
        >
          Terminated Vendors
        </Text>

        <FlashList
          data={data?.deletedVendors}
          renderItem={({ item, index }: { item: any; index: number }) =>
            renderDeletedVendor({ item, index })
          }
          keyExtractor={(item: { _id: string }) => item._id}
          estimatedItemSize={130}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={[
                layout.itemsCenter,
                layout.justifyCenter,
                { marginTop: 50 },
              ]}
            >
              <Text style={[fonts.size_16, fonts.gray400]}>
                No Deleted Vendors Found.
              </Text>
            </View>
          }
        />
      </View>
    </SafeScreen>
  );
};

export default DeletedVendors;
