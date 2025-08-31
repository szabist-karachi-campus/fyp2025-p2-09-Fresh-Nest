import { toast } from '@backpackapp-io/react-native-toast';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import DashboardButton from '@/components/molecules/DashboardButton';
import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import { useDeleteVendor, useGetVendorById } from '@/queries/super.queries';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  AdminPaths.VendorDetails
>;

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { gutters, fonts, backgrounds, borders } = useTheme();
  return (
    <View
      style={[
        gutters.marginBottom_16,
        backgrounds.gray100,
        gutters.padding_16,
        borders.roundedTop_16,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
    >
      <Text style={[fonts.size_24, gutters.marginBottom_12]}>{title}</Text>
      {children}
    </View>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean;
}) => {
  const { layout, fonts, gutters } = useTheme();
  return (
    <View style={[layout.row, layout.justifyBetween, gutters.marginBottom_8]}>
      <Text style={fonts.size_16}>{label}</Text>
      <Text style={[fonts.size_16, { fontWeight: '600' }]}>
        {String(value)}
      </Text>
    </View>
  );
};

const VendorDetails = () => {
  const { params }: any = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { id } = params;
  const { data, isLoading } = useGetVendorById(id);
  const { layout, gutters } = useTheme();
  const { mutateAsync } = useDeleteVendor();

  const handleDelete = async () => {
    try {
      await mutateAsync(id);
      toast.success('Vendor deleted successfully');
      navigation.goBack();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete vendor');
    }
  };

  if (isLoading || !data?.vendor) {
    return (
      <SafeScreen>
        <View style={[layout.itemsCenter, layout.justifyCenter]}>
          <Text>Loading...</Text>
        </View>
      </SafeScreen>
    );
  }

  const { vendor } = data;

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={gutters.padding_16}>
        <SectionCard title="Vendor Info">
          <InfoRow label="Name" value={vendor.name} />
          <InfoRow label="Email" value={vendor.email} />
          <InfoRow label="Phone" value={vendor.phone} />
          <InfoRow label="CNIC" value={vendor.cnic} />
          <InfoRow
            label="Wallet Balance"
            value={'Rs. ' + (vendor.wallet?.balance ?? '0')}
          />
          <InfoRow
            label="Stripe ID"
            value={vendor.stripeConnectedId || 'N/A'}
          />
        </SectionCard>

        <DashboardButton
          title="Products"
          icon={<Icons.FontAwesome5 name="tags" size={24} color="#fff" />}
          onPress={() =>
            navigation.navigate(AdminPaths.VendorProducts, {
              products: vendor.products,
              vendorName: vendor.name,
            })
          }
          style={{ backgroundColor: '#1abc9c' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Orders"
          icon={
            <Icons.FontAwesome5 name="shopping-bag" size={24} color="#fff" />
          }
          onPress={() =>
            navigation.navigate(AdminPaths.VendorOrderList, {
              orders: vendor.orders,
              vendorName: vendor.name,
            })
          }
          style={{ backgroundColor: '#6c5ce7' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Subscriptions"
          icon={<Icons.FontAwesome5 name="sync-alt" size={24} color="#fff" />}
          onPress={() =>
            navigation.navigate(AdminPaths.vendorSubcriptionList, {
              subscriptions: vendor.subscriptions,
            })
          }
          style={{ backgroundColor: '#9b59b6' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Advertisements"
          icon={<Icons.FontAwesome5 name="bullhorn" size={24} color="#fff" />}
          onPress={() =>
            navigation.navigate(AdminPaths.vendorAdList, {
              ads: vendor.ads,
              vendorName: vendor.name,
            })
          }
          style={{ backgroundColor: '#e67e22' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Wallet Transactions"
          icon={<Icons.FontAwesome5 name="wallet" size={24} color="#fff" />}
          onPress={() =>
            navigation.navigate(AdminPaths.vendorWalletTransactions, {
              walletTransactions: vendor.walletTransactions,
            })
          }
          style={{ backgroundColor: '#2ecc71' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="View Certificate"
          icon={<Icons.FontAwesome5 name="certificate" size={24} color="#fff" />}
          onPress={() =>
            navigation.navigate(AdminPaths.Certificate, {
              certificate: vendor.certificationImage,
            })
          }
          style={{ backgroundColor: '#3498db' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Terminate Vendor"
          icon={<Icons.FontAwesome5 name="trash" size={24} color="#fff" />}
          onPress={async () => {
            Alert.alert(
              'Delete Vendor',
              'Are you sure you want to delete this vendor?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: handleDelete,
                },
              ],
              { cancelable: true },
            );
          }}
          style={{ backgroundColor: '#e74c3c' }}
          lableStyle={{ color: '#fff' }}
        />
      </ScrollView>
    </SafeScreen>
  );
};

export default VendorDetails;
