import type { Paths } from '@/navigation/paths';
import { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type RootStackParamList = {
  [Paths.Startup]: undefined;
  [Paths.Login]: undefined;
  [Paths.Signup]: undefined;
  [Paths.Forgot]: undefined;
  [Paths.ChangePassword]: { email: string };
  [Paths.OTP]: { email: string; context: string };
  [Paths.Tabs]: undefined;
  [Paths.HomeStack]: NavigatorScreenParams<HomeStackParamList>;
  [Paths.Home]: undefined;
  [Paths.Products]: { id: string };
  [Paths.CartStack]: NavigatorScreenParams<CartStackParamList>;
  [Paths.Cart]: undefined;
  [Paths.Checkout]: undefined;
  [Paths.Payment]: undefined;
  [Paths.ProfileStack]: NavigatorScreenParams<ProfileStackParamList>;
  [Paths.Profile]: undefined;
  [Paths.Settings]: undefined;
  [Paths.Orders]: undefined;
  [Paths.OrderDetails]: { id: string };
  [Paths.WalletDetails]: { id: string };
  [Paths.Subscriptions]: undefined;
  [Paths.SubscriptionsDetails]: { id: string };
  [Paths.CreateSubscription]: undefined;
  [Paths.ChatList]: undefined;
  [Paths.Chat]: {
    threadId: string;
    vendorId: string;
    name: string;
    recieverModel: 'Vendor' | 'SuperAdmin' | 'User';
  };
};

export type HomeStackParamList = {
  [Paths.Home]: undefined;
  [Paths.Products]: { id: string };
};
export type CartStackParamList = {
  [Paths.Cart]: undefined;
  [Paths.Checkout]: undefined;
  [Paths.Payment]: undefined;
  [Paths.CreateSubscription]: undefined;
};

export type ProfileStackParamList = {
  [Paths.Profile]: undefined;
  [Paths.Settings]: undefined;
  [Paths.Orders]: undefined;
  [Paths.OrderDetails]: { id: string };
  [Paths.WalletDetails]: { id: string };
  [Paths.Subscriptions]: undefined;
  [Paths.SubscriptionsDetails]: { id: string };
  [Paths.Chat]: {
    threadId: string;
    vendorId: string;
    name: string;
    recieverModel: string;
  };
};

export type ChatStackParamList = {
  [Paths.Chat]: {
    threadId: string;
    vendorId: string;
    name: string;
    recieverModel: 'Vendor' | 'SuperAdmin' | 'User';
  };
  [Paths.ChatList]: undefined;
};
