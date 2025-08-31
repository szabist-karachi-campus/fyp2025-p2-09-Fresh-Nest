import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Text } from 'react-native';

import * as Icons from '@/components/molecules/icons';
import {
  AdminDashboard,
  Certificate,
  Chat,
  DeletedUsers,
  DeletedVendors,
  DisputeList,
  UserDetails,
  UserList,
  UserOrder,
  UserSubscriptions,
  UserTransactions,
  VendorAdsList,
  VendorApproval,
  VendorDetails,
  VendorOrderList,
  VendorProducts,
  VendorProductView,
  VendorRequests,
  VendorSubscriptionsList,
  VendorWalletTransactions,
  VerifiedVendors,
} from '@/screens';

import { AdminPaths, Paths } from './paths';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AdminDashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={AdminPaths.AdminDashboard}
    >
      <Stack.Screen
        name={AdminPaths.AdminDashboard}
        component={AdminDashboard}
      />
      <Stack.Screen
        name={AdminPaths.VendorRequests}
        component={VendorRequests}
      />
      <Stack.Screen
        name={AdminPaths.VerifiedVendors}
        component={VerifiedVendors}
      />
      <Stack.Screen
        name={AdminPaths.VendorApproval}
        component={VendorApproval}
      />
      <Stack.Screen
        name={AdminPaths.VendorProducts}
        component={VendorProducts}
      />
      <Stack.Screen name={AdminPaths.VendorDetails} component={VendorDetails} />
      <Stack.Screen
        name={AdminPaths.VendorProductView}
        component={VendorProductView}
      />
      <Stack.Screen
        name={AdminPaths.VendorOrderList}
        component={VendorOrderList}
      />
      <Stack.Screen
        name={AdminPaths.vendorSubcriptionList}
        component={VendorSubscriptionsList}
      />
      <Stack.Screen name={AdminPaths.vendorAdList} component={VendorAdsList} />
      <Stack.Screen
        name={AdminPaths.vendorWalletTransactions}
        component={VendorWalletTransactions}
      />
      <Stack.Screen
        name={AdminPaths.Certificate}
        component={Certificate}
      />
      <Stack.Screen name={AdminPaths.UserList} component={UserList} />
      <Stack.Screen name={AdminPaths.UserDetails} component={UserDetails} />
      <Stack.Screen name={AdminPaths.UserOrders} component={UserOrder} />
      <Stack.Screen
        name={AdminPaths.UserSubscriptions}
        component={UserSubscriptions}
      />
      <Stack.Screen
        name={AdminPaths.UserTransactions}
        component={UserTransactions}
      />
      <Stack.Screen name={AdminPaths.DeletedUsers} component={DeletedUsers} />
      <Stack.Screen
        name={AdminPaths.DeletedVendors}
        component={DeletedVendors}
      />
    </Stack.Navigator>
  );
}


function DisputeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AdminPaths.DisputeList} component={DisputeList} />
      <Stack.Screen name={Paths.Chat} component={Chat} />
    </Stack.Navigator>
  );
}

export default function AdminTabsNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name={AdminPaths.AdminDashboardStack}
        component={AdminDashboardStack}
        options={{
          headerShown: false,
          tabBarLabel: ({ color }) => <Text style={{ color }}>Dashboard</Text>,
          tabBarIcon: ({ color, size }) => (
            <Icons.MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={AdminPaths.DisputeStack}
        component={DisputeStack}
        options={{
          headerShown: false,
          tabBarLabel: ({ color }) => <Text style={{ color }}>Disputes</Text>,
          tabBarIcon: ({ color, size }) => (
            <Icons.FontAwesome5 name="comments" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
