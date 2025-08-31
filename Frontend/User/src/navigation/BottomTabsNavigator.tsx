import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Paths } from './paths';
import {
  Cart,
  Checkout,
  Home,
  OrderDetails,
  Orders,
  Product,
  Profile,
  Settings,
  WalletDetails,
  Subscriptions,
  SubscriptionsDetails,
  Chat,
  ChatList,
} from '@/screens';
import { createStackNavigator } from '@react-navigation/stack';
import CreateSubscription from '@/screens/CreateSubscriptions';
import { useStores } from '@/stores';
import { observer } from 'mobx-react-lite';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: true }}
      initialRouteName={Paths.Home}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name={Paths.Home}
        component={Home}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={Paths.Products}
        component={Product}
      />
    </Stack.Navigator>
  );
}
function CartStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: true }}
      initialRouteName={Paths.Cart}
    >
      <Stack.Screen
        options={{ headerShown: true }}
        name={Paths.Cart}
        component={Cart}
      />
      <Stack.Screen
        options={{ headerShown: true, title: 'Check out' }}
        name={Paths.Checkout}
        component={Checkout}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
        }}
        name={Paths.CreateSubscription}
        component={CreateSubscription}
      />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: true }}
      initialRouteName={Paths.Profile}
    >
      <Stack.Screen
        options={{ headerShown: false }}
        name={Paths.Profile}
        component={Profile}
      />
      <Stack.Screen
        options={{ headerShown: true, title: 'Settings' }}
        name={Paths.Settings}
        component={Settings}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={Paths.Orders}
        component={Orders}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Order Details',
          headerBackTitle: 'Back',
        }}
        name={Paths.OrderDetails}
        component={OrderDetails}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name={Paths.WalletDetails}
        component={WalletDetails}
      />
      <Stack.Screen
        options={{ headerShown: true, title: 'Subscriptions' }}
        name={Paths.Subscriptions}
        component={Subscriptions}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Subscription Details',
          headerBackTitle: 'Back',
        }}
        name={Paths.SubscriptionsDetails}
        component={SubscriptionsDetails}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Chat',
          headerBackTitle: 'Back',
        }}
        name={Paths.Chat}
        component={Chat}
      />
    </Stack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: true }}
      initialRouteName={Paths.ChatList}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Chat',
        }}
        name={Paths.ChatList}
        component={ChatList}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Chat',
          headerBackTitle: 'Back',
        }}
        name={Paths.Chat}
        component={Chat}
      />
    </Stack.Navigator>
  );
}

function BottomTabsNavigator() {
  const { backgrounds } = useTheme();
  const { cart: cartStore } = useStores();

  return (
    <Tab.Navigator
      initialRouteName={Paths.HomeStack}
      screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName = 'home';
          if (route.name === Paths.HomeStack) {
            iconName = 'home';
          } else if (route.name === Paths.CartStack) {
            iconName = 'shopping-bag';
          } else if (route.name === Paths.ProfileStack) {
            iconName = 'user-alt';
          } else if (route.name === Paths.ChatStack) {
            iconName = 'comments';
          }
          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: backgrounds.gray100.backgroundColor,
          height: '10%',
        },
      })}
    >
      <Tab.Screen
        name={Paths.HomeStack}
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name={Paths.CartStack}
        component={CartStackNavigator}
        options={{
          headerShown: false,
          tabBarBadge:
            cartStore.cartItems.length > 0
              ? cartStore.cartItems.length
              : undefined,
        }}
      />
      <Tab.Screen
        name={Paths.ChatStack}
        component={ChatStackNavigator}
        options={{ headerShown: false, title: 'Chat' }}
      />
      <Tab.Screen
        name={Paths.ProfileStack}
        component={ProfileStackNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default observer(BottomTabsNavigator);
