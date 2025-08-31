import { toast } from '@backpackapp-io/react-native-toast';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import DashboardButton from '@/components/molecules/DashboardButton';
import * as Icons from '@/components/molecules/icons';
import { SafeScreen } from '@/components/templates';

import { useDeleteUser, useGetUserById } from '@/queries/super.queries';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  AdminPaths.UserDetails
>;

type ProductScreenProps = RouteProp<RootStackParamList, AdminPaths.UserDetails>;

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
      <Text style={[fonts.size_24, fonts.bold, gutters.marginBottom_12]}>
        {title}
      </Text>
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

const UserDetails = () => {
  const route = useRoute<ProductScreenProps>();
  const navigation = useNavigation<NavigationProp>();
  const { userId } = route.params;
  const { data, isLoading } = useGetUserById(userId);
  const user = data?.user || {};
  const { layout, gutters } = useTheme();
  const { mutateAsync } = useDeleteUser();

  const handleDelete = async () => {
    try {
      await mutateAsync(userId);
      toast.success('user deleted successfully');
      navigation.goBack();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    }
  };

  if (isLoading || !data?.user) {
    return (
      <SafeScreen>
        <View style={[layout.itemsCenter, layout.justifyCenter]}>
          <Text>Loading...</Text>
        </View>
      </SafeScreen>
    );
  }
  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={gutters.padding_16}>
        <SectionCard title="User Information">
          <InfoRow label="Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Address" value={user.address ?? 'N/A'} />
          <InfoRow
            label="Wallet Balance"
            value={'Rs. ' + (user.wallet?.balance ?? '0')}
          />
        </SectionCard>

        <DashboardButton
          title="Orders"
          icon={
            <Icons.FontAwesome5 name="shopping-bag" size={24} color="#fff" />
          }
          onPress={() =>
            navigation.navigate(AdminPaths.UserOrders, {
              orders: user.orders,
            })
          }
          style={{ backgroundColor: '#3498db' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Subscriptions"
          icon={<Icons.FontAwesome5 name="sync-alt" size={24} color="#fff" />}
          onPress={() =>
            navigation.navigate(AdminPaths.UserSubscriptions, {
              subscriptions: user.subscriptions,
            })
          }
          style={{ backgroundColor: '#9b59b6' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Wallet Transactions"
          icon={<Icons.FontAwesome5 name="wallet" size={24} color="#fff" />}
          onPress={() =>
            navigation.navigate(AdminPaths.UserTransactions, {
              walletTransactions: user.walletTransactions,
            })
          }
          style={{ backgroundColor: '#2ecc71' }}
          lableStyle={{ color: '#fff' }}
        />

        <DashboardButton
          title="Delete user"
          icon={<Icons.FontAwesome5 name="trash" size={24} color="#fff" />}
          onPress={async () => {
            Alert.alert(
              'Delete user',
              'Are you sure you want to delete this user?',
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

export default UserDetails;
