import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Text } from 'react-native';

import { useTheme } from '@/theme';

import * as Icons from '@/components/molecules/icons';
import {
  AddProduct,
  AdPerformance,
  Analytics,
  ChangePassword,
  Chat,
  ChatList,
  CreateAd,
  Home,
  OrderDetails,
  Orders,
  ProductDetails,
  Products,
  Profile,
  WalletScreen,
} from '@/screens';

import { Paths, TabPaths } from './paths';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HeaderTitle = ({ title }: any) => {
  const text = title?.text || 'Default Title';
  const { fonts } = useTheme();
  return (
    <Text
      style={[{ fontWeight: fonts.bold ? 'bold' : 'normal' }, fonts.gray800]}
    >
      {text}
    </Text>
  );
};

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={TabPaths.Home}
    >
      <Stack.Screen name={TabPaths.Home} component={Home} />
      <Stack.Screen name={TabPaths.Products} component={Products} />
      <Stack.Screen name={TabPaths.AddProduct} component={AddProduct} />
      <Stack.Screen name={TabPaths.ProductDetails} component={ProductDetails} />
      <Stack.Screen name={TabPaths.CreateAd} component={CreateAd} />
      <Stack.Screen name={TabPaths.AdPerformance} component={AdPerformance} />
      <Stack.Screen name={TabPaths.Orders} component={Orders} />
      <Stack.Screen name={TabPaths.OrderDetails} component={OrderDetails} />
      <Stack.Screen name={TabPaths.Analytics} component={Analytics} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={TabPaths.Profile}
    >
      <Stack.Screen
        options={{
          headerStyle: { borderWidth: 1 },
          title: 'Profile',
          headerTitle: () => (
            <HeaderTitle title={{ bold: true, text: 'Profile' }} />
          ),
        }}
        name={TabPaths.Profile}
        component={Profile}
      />
      <Stack.Screen
        options={{
          headerStyle: { borderWidth: 1 },
          headerShown: false,
          title: 'Wallet Details',
          headerTitle: () => (
            <HeaderTitle title={{ bold: true, text: 'Wallet Details' }} />
          ),
        }}
        name={Paths.WalletDetails}
        component={WalletScreen}
      />
      <Stack.Screen
        options={{
          headerStyle: { borderWidth: 1 },
          headerShown: false,
          title: 'Chats',
          headerTitle: () => (
            <HeaderTitle title={{ bold: true, text: 'Chats' }} />
          ),
        }}
        name={Paths.ChatList}
        component={ChatList}
      />
      <Stack.Screen name={Paths.ChangePassword} component={ChangePassword} />
    </Stack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={Paths.ChatList}
    >
      <Stack.Screen
        options={{
          headerStyle: { borderWidth: 1 },
          headerShown: false,
          title: 'Chats',
          headerTitle: () => (
            <HeaderTitle title={{ bold: true, text: 'Chats' }} />
          ),
        }}
        name={Paths.ChatList}
        component={ChatList}
      />
      <Stack.Screen
        options={{
          headerStyle: { borderWidth: 1 },
          headerShown: false,
          title: 'Chats',
          headerTitle: () => (
            <HeaderTitle title={{ bold: true, text: 'Chats' }} />
          ),
        }}
        name={Paths.Chat}
        component={Chat}
      />
    </Stack.Navigator>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name={TabPaths.HomeStack}
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: string;
          }) => <Text style={{ color }}>Dashboard</Text>,
          tabBarIcon: ({
            focused,
            color,
            size,
          }: {
            focused: boolean;
            color: string;
            size: number;
          }) => (
            <Icons.MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabPaths.ChatStack}
        component={ChatStackNavigator}
        options={{
          headerShown: false,
          headerTitle: () => (
            <HeaderTitle title={{ bold: true, text: 'Chats' }} />
          ),
          tabBarLabel: ({ color }: { focused: boolean; color: string }) => (
            <Text style={{ color }}>Chats</Text>
          ),
          tabBarIcon: ({
            color,
            size,
          }: {
            focused: boolean;
            color: string;
            size: number;
          }) => (
            <Icons.FontAwesome5 name="comments" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={TabPaths.ProfileStack}
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          headerTitle: () => (
            <HeaderTitle title={{ bold: true, text: 'Profile' }} />
          ),
          tabBarLabel: ({ color }: { focused: boolean; color: string }) => (
            <Text style={{ color }}>Profile</Text>
          ),
          tabBarIcon: ({
            color,
            size,
          }: {
            focused: boolean;
            color: string;
            size: number;
          }) => <Icons.FontAwesome5 name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
