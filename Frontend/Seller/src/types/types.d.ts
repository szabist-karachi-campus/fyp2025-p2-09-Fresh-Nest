type Fields = {
  name: string; // Name of the field
  key: string; // Unique key for the field (used as React key)
  placeholder: string; // Placeholder text displayed in the input
  type:
    | 'email'
    | 'password'
    | 'text'
    | 'name'
    | 'contact no.'
    | 'number'
    | 'cnic'
    | 'cost'
    | 'budget';
  keyboardType?: keyboardType; // Supported keyboard types
  secure?: boolean;
};

type keyboardType = 'default' | 'email-address' | 'phone-pad';

type signupRequest = {
  name: string;
  email: string;
  phone: string;
  cnic: string;
  password: string;
  confirmPassword: string;
};

type loginRequest = {
  email: string;
  password: string;
  deviceToken?: string;
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

type Product = {
  id: string;
  views: ReactNode;
  _id: string;
  name: string;
  price: Number;
  description: string;
  category: string;
  vendor: string;
  image: string[];
  isBoosted: boolean;
  unit: string;
};

type UpdateProductRequest = {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
};

type addImageRequest = {
  images: any[];
  productId: string;
};

type createOrderRequest = {
  product: string;
  quantity: number;
  total: number;
};

type Orders = {
  _id: string;
  user: string;
  product: string;
  quantity: number;
  status:
    | 'Pending'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled'
    | string;
  total: number;
  vendor: string;
  createdAt: Date;
  updatedAt: Date;
};
type OrdersCard = {
  _id: string;
  user: string;
  products: {
    _id: string;
    name: string;
    price: number;
    vendor: string;
  }[];
  quantities: number[];
  status: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  orderNo: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type Category = {
  _id: string;
  name: string;
};

type updateStatus = {
  orderId: string;
  status: string;
};

interface Location {
  latitude: number;
  longitude: number;
}

type SectionCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  height: number;
};

type sendMessageRequest = {
  message: string;
  orderId: string;
  title: string;
  receiverModel: 'User' | 'Vendor' | 'SuperAdmin';
  receiverId?: string;
  threadId?: string;
};
