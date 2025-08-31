const authQueries = {
  userLogin: 'userLogin',
  userSignup: 'userSignup',
  verifyOTP: 'verifyOTP',
  forgotPassword: 'forgotPassword',
  isResetTokenValid: 'isResetTokenValid',
  changePassword: 'changePassword',
  addAddress: 'addAddress',
  getWalletBalance: 'getWalletBalance',
  uploadCert: 'uploadCertification',
  getCert: 'getCertification',
};

const productQueries = {
  getProduct: 'getProduct',
  getProducts: 'getProducts',
  createProduct: 'createProduct',
  uploadProductImages: 'uploadProductImages',
  deleteProduct: 'deleteProduct',
  updateProduct: 'updateProduct',
};

const orderQueries = {
  createOrders: 'createOrders',
  getOrders: 'getOrders',
  updateOrderStatus: 'updateOrderStatus',
  getVendorSales: 'getVendorSales',
  cancelOrder: 'cancelOrder',
};

const categoryQueries = {
  getCategories: 'getCategories',
};

const adQueries = {
  getBidRange: 'getBidRange',
  createAd: 'createAd',
  updateAd: 'updateAd',
  getAdPerformance: 'getAdPerformance',
  getAdByProduct: 'getAdByProduct',
};

const walletQueries = {
  getWalletTransactions: 'getWalletTransactions',
  connectStripe: 'connectStripe',
  withdrawVendorMoney: 'withdrawVendorMoney',
  topUpWallet: 'topUpWallet',
};

const analyticsQueries = {
  getVendorRevenue: 'getVendorRevenue',
  getOrderAnalytics: 'getOrderAnalytics',
  getBestseller: 'getBestseller',
  getAdAnalytics: 'getAdAnalytics',
  getSubscriptionAnalytics: 'getSubscriptionAnalytics',
  getMonthlySalesAnalytics: 'getMonthlySalesAnalytics',
};

const superQueries = {
  getVerifiedVendors: 'getVerifiedVendors',
  getVendorRequests: 'getVendorRequests',
  approveVendorRequest: 'approveVendorRequest',
  getVendorById: 'getVendorById',
  rejectVendorRequest: 'rejectVendorRequest',
  getAdminProfile: 'getAdminProfile',
  updateAdminProfile: 'updateAdminProfile',
  deleteVendor: 'deleteVendor',
  getUserList: 'getUserList',
  getUserById: 'getUserById',
  deleteUser: 'deleteUser',
  getDeletedUsers: 'getDeletedUsers',
  getDeletedVendors: 'getDeletedVendors',
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
  categoryQueries,
  adQueries,
  walletQueries,
  analyticsQueries,
  superQueries,
  chatsQueries,
};
