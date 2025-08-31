import RNBounceable from '@freakycoder/react-native-bounceable';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { AdminPaths, Paths } from '@/navigation/paths';
import { RootStackParamList } from '@/navigation/types';

import DashboardButton from '@/components/molecules/DashboardButton';
import * as Icons from '@/components/molecules/icons';

import {
  useGetVendorWaitingList,
  useGetVerifiedVendors,
} from '@/queries/super.queries';
import { useStores } from '@/stores';

type NavigationProp = StackNavigationProp<RootStackParamList, any>;

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) => {
  const { layout, borders, gutters } = useTheme();

  return (
    <View
      style={[
        layout.row,
        layout.itemsCenter,
        gutters.padding_16,
        borders.rounded_16,
        {
          backgroundColor: color,
          marginBottom: 16,
        },
      ]}
    >
      {icon}
      <View style={[{ marginLeft: 12 }]}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
          {title}
        </Text>
        <Text style={{ color: '#fff', fontSize: 24 }}>{value}</Text>
      </View>
    </View>
  );
};

const AdminDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const { layout, gutters, fonts, borders } = useTheme();
  const { data: VerifiedVendors } = useGetVerifiedVendors();
  const { data: VendorWaitingList } = useGetVendorWaitingList();
  const { auth, user } = useStores();

  const totalVendors =
    VerifiedVendors?.vendors.length + VendorWaitingList?.vendors.length;
  const pendingVendors = VendorWaitingList?.vendors.length;

  return (
    <ScrollView
      contentContainerStyle={[gutters.padding_16, gutters.marginTop_40]}
    >
      <View
        style={[
          layout.flex_1,
          layout.row,
          layout.itemsCenter,
          layout.justifyBetween,
          gutters.paddingVertical_16,
          gutters.paddingHorizontal_8,
          gutters.marginBottom_16,
          borders.wBottom_2,
          borders.gray100,
        ]}
      >
        <Text style={[fonts.size_24, fonts.bold, fonts.gray800]}>
          Super Admin Dashboard
        </Text>
        <RNBounceable
          onPress={() => {
            auth.setMany({
              token: '',
              isSuperAdmin: false,
            });
            user.setMany({
              name: '',
              email: '',
              phone: '',
              verified: false,
              cnic: '',
            });
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: Paths.Login }],
              }),
            );
          }}
        >
          <Icons.MaterialIcons name="logout" size={24} color="#333" />
        </RNBounceable>
      </View>
      <StatCard
        title="Total Vendors"
        value={totalVendors}
        icon={<Icons.FontAwesome5 name="store" size={30} color="#fff" />}
        color="#6c63ff"
      />
      <StatCard
        title="Pending Approvals"
        value={pendingVendors}
        icon={
          <Icons.MaterialIcons name="pending-actions" size={30} color="#fff" />
        }
        color="#ff9f43"
      />
      <DashboardButton
        title="Review Vendor Requests"
        icon={
          <Icons.FontAwesome5 name="clipboard-check" size={24} color="#fff" />
        }
        style={{ backgroundColor: '#27ae60' }} // Emerald Green
        lableStyle={{ color: '#fff' }}
        onPress={() => navigation.navigate(AdminPaths.VendorRequests)}
      />

      <DashboardButton
        title="Manage Verified Vendors"
        icon={<Icons.FontAwesome5 name="user-cog" size={24} color="#fff" />}
        style={{ backgroundColor: '#2980b9' }} // Strong Blue
        lableStyle={{ color: '#fff' }}
        onPress={() => navigation.navigate(AdminPaths.VerifiedVendors)}
      />

      <DashboardButton
        title="Manage Users"
        icon={<Icons.FontAwesome5 name="users" size={24} color="#fff" />}
        style={{ backgroundColor: '#8e44ad' }}
        lableStyle={{ color: '#fff' }}
        onPress={() => navigation.navigate(AdminPaths.UserList)}
      />

      <DashboardButton
        title="Terminated Vendors"
        icon={<Icons.FontAwesome5 name="ban" size={24} color="#fff" />}
        style={{ backgroundColor: '#c0392b' }}
        lableStyle={{ color: '#fff' }}
        onPress={() => navigation.navigate(AdminPaths.DeletedVendors)}
      />

      <DashboardButton
        title="Deleted Users"
        icon={<Icons.FontAwesome5 name="user-times" size={24} color="#fff" />}
        style={{ backgroundColor: '#e67e22' }}
        lableStyle={{ color: '#fff' }}
        onPress={() => navigation.navigate(AdminPaths.DeletedUsers)}
      />
    </ScrollView>
  );
};

export default AdminDashboard;
