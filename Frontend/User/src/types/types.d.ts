type Fields = {
  name: string; // Name of the field
  key: string; // Unique key for the field (used as React key)
  placeholder: string; // Placeholder text displayed in the input
  type: 'email' | 'password' | 'text' | 'name' | 'contact no.' | 'number'; // Allowed input types (limited to what you use)
  keyboardType?: keyboardType; // Supported keyboard types
  secure?: boolean;
};

type keyboardType = 'default' | 'email-address' | 'phone-pad';

type signupRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type loginRequest = {
  email: string;
  password: string;
};

type forgotPasswordRequest = {
  email: string;
  type: string;
};

type isResetTokenValidRequest = {
  email: string;
  token: string;
};

type verifyOTP = {
  email: string;
  otp: string;
  type: string;
};

type changePasswordRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};

type addAddressRequest = {
  address: string;
  city: string;
  state: string;
  postalcode: string;
};

type createOrderRequest = {
  products: string[];
  quantities: number[];
  total: number;
  paymentMethod: string;
};

type Orders = {
  _id: string;
  user: string;
  product: string;
  quantity: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  vendor: string;
  createdAt: Date;
  updatedAt: Date;
};

type Product = {
  _id?: string;
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  vendor: vendor;
  isBoosted: boolean;
  image: string[];
  unit: string;
  orderId?: string;
};

type vendor = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  verified: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
};

type createPaymentIntentRequest = {
  token: string;
  amount: number;
  topup?: boolean;
  orderNo?: string;
  userType?: 'User' | 'Vendor';
};

type CreateSubscriptionRequest = {
  products: {
    product: string;
    quantity: number;
  }[];
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'daily' | 'weekly' | 'monthly';
  nextDeliveryDate: string;
  paymentMethod: 'Cash on Delivery' | 'Cashless';
};

type UpdateSubscriptionRequest = {
  frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'daily' | 'weekly' | 'monthly';
  products?: {
    product: string;
    quantity: number;
  }[];
  nextDeliveryDate?: string; // ISO 8601 date string
  isActive?: boolean;
};

type sendMessageRequest = {
  message: string;
  orderId: string;
  title: string;
  receiverModel: 'User' | 'Vendor' | 'SuperAdmin';
  receiverId?: string;
  threadId?: string;
};
