import type { StackScreenProps } from '@react-navigation/stack';
import type { AdminPaths, Paths, TabPaths } from '@/navigation/paths';

export type RootStackParamList = {
  [Paths.Example]: undefined;
  [Paths.Startup]: undefined;
  [Paths.Login]: undefined;
  [Paths.Signup]: undefined;
  [Paths.ForgotPassword]: undefined;
  [Paths.OTP]: undefined | { email: string; context: string };
  [Paths.ChangePassword]: { email: string };
  [Paths.Tabs]: undefined;
  [TabPaths.Home]: undefined;
  [TabPaths.Profile]: undefined;
  [TabPaths.Products]: undefined;
  [TabPaths.AddProduct]: undefined;
  [TabPaths.ProductDetails]: { id: string };
  [TabPaths.CreateAd]: { id: string };
  [TabPaths.AdPerformance]: { id: string };
  [TabPaths.Orders]: undefined;
  [TabPaths.OrderDetails]: { id: string };
  [TabPaths.Analytics]: undefined;
  [Paths.WalletDetails]: { id: string };
  [Paths.AdminTabs]: undefined;
  [AdminPaths.AdminDashboard]: undefined;
  [AdminPaths.VerifiedVendors]: undefined;
  [AdminPaths.VendorRequests]: undefined;
  [AdminPaths.VendorDetails]: { id: string };
  [AdminPaths.VendorApproval]: { vendor: any };
  [AdminPaths.VendorProducts]: { products: any[]; vendorName: string };
  [AdminPaths.VendorProductView]: { product: any; vendorName: string };
  [AdminPaths.VendorOrderList]: { orders: any[]; vendorName: string };
  [AdminPaths.vendorSubcriptionList]: {
    subscriptions: any[];
  };
  [AdminPaths.vendorAdList]: { ads: any[]; vendorName: string };
  [AdminPaths.vendorWalletTransactions]: {
    walletTransactions: any[];
  };
  [AdminPaths.Certificate]: { certificate: string };
  [AdminPaths.UserList]: undefined;
  [AdminPaths.UserDetails]: { userId: string };
  [AdminPaths.UserOrders]: { orders: any[] };
  [AdminPaths.UserSubscriptions]: { subscriptions: any[] };
  [AdminPaths.UserTransactions]: { walletTransactions: any[] };
  [AdminPaths.DeletedUsers]: undefined;
  [AdminPaths.DeletedVendors]: undefined;
  [AdminPaths.DisputeList]: undefined;
  [Paths.ChatList]: undefined;
  [Paths.Chat]: {
    threadId: string;
    vendorId: string;
    name: string;
    recieverModel: 'Vendor' | 'SuperAdmin' | 'User';
  };
};

export type RootScreenProps<
  S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
