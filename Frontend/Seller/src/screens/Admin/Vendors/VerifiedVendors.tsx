import RNBounceable from '@freakycoder/react-native-bounceable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import { useGetVerifiedVendors } from '@/queries/super.queries';

type NavigationProp = StackNavigationProp<RootStackParamList, any>;

const VerifiedVendors = () => {
  const { layout, gutters, fonts, borders } = useTheme();
  const { data: vendorsData } = useGetVerifiedVendors();
  const navigation = useNavigation<NavigationProp>();

  const renderVendorCard = ({ item }: { item: any }) => (
    <RNBounceable
      onPress={() =>
        navigation.navigate(AdminPaths.VendorDetails, { id: item._id })
      }
      key={item._id}
      style={[
        gutters.padding_12,
        gutters.marginBottom_12,
        borders.rounded_16,
        {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 1,
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

      <View style={[layout.row, layout.itemsCenter]}>
        <Icons.Feather name="phone" size={16} color="#6b7280" />
        <Text style={[fonts.size_16, fonts.gray800, gutters.marginLeft_8]}>
          {item.phone}
        </Text>
      </View>
    </RNBounceable>
  );

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
          Verified Vendors
        </Text>
        <FlashList
          data={vendorsData?.vendors}
          renderItem={renderVendorCard}
          keyExtractor={(item) => item._id}
          estimatedItemSize={90}
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
                No verified vendors found.
              </Text>
            </View>
          }
        />
      </View>
    </SafeScreen>
  );
};

export default VerifiedVendors;
