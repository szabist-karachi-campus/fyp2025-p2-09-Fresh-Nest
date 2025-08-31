const authQueries = {
  userLogin: 'userLogin',
  userSignup: 'userSignup',
  verifyOTP: 'verifyOTP',
  forgotPassword: 'forgotPassword',
  isResetTokenValid: 'isResetTokenValid',
  changePassword: 'changePassword',
  addAddress: 'addAddress',
  getWalletBalance: 'getWalletBalance',
  getWalletTransactions: 'getWalletTransactions',
};

const productQueries = {
  getProduct: 'getProducts',
  getAds: 'getAds',
  countClick: 'countClick',
  countView: 'countView',
};

const orderQueries = {
  createOrders: 'createOrders',
  getOrders: 'getOrders',
  updateOrderStatus: 'updateOrderStatus',
  cancelOrder: 'cancelOrder',
  cancelOrderById: 'cancelOrderById',
};
const paymentQueries = {
  createPayment: 'createPayment',
  topUpWallet: 'topUpWallet',
};

const subscriptionsQueries = {
  getUserSubscriptions: 'getUserSubscriptions',
  createSubscription: 'createSubscription',
  updateSubscription: 'updateSubscription',
  cancelSubscription: 'cancelSubscription',
};

const chatsQueries = {
  getThreadByOrderId: 'getThreadByOrderId',
  getAllThreads: 'getAllThreads',
  sendMessage: 'sendMessage',
  getThreadById: 'getThreadById',
};

export const REACT_QUERY_KEYS = {
  authQueries,
  productQueries,
  orderQueries,
  paymentQueries,
  subscriptionsQueries,
  chatsQueries,
};
