const API_BASE = '/api/v1';

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('calzare_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const sessionId = localStorage.getItem('calzare_session_id');
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  return headers;
};

// Generic fetch wrapper
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.isFormData
    ? {
        ...(localStorage.getItem('calzare_token')
          ? { Authorization: `Bearer ${localStorage.getItem('calzare_token')}` }
          : {}),
      }
    : { ...getAuthHeaders(), ...options.headers };

  const config = {
    ...options,
    headers,
  };

  if (options.body && !options.isFormData && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body }),
  addAddress: (body) => request('/auth/address', { method: 'POST', body }),
  deleteAddress: (addressId) => request(`/auth/address/${addressId}`, { method: 'DELETE' }),

  // Products & Catalog
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductBySlug: (slug) => request(`/products/${slug}`),
  searchProducts: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
  getCategories: () => request('/catalog/categories'),
  getCollections: () => request('/catalog/collections'),
  getCollectionBySlug: (slug) => request(`/catalog/collections/${slug}`),

  // Homepage
  getHomepage: () => request('/homepage'),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (body) => request('/cart/add', { method: 'POST', body }),
  updateCartItem: (itemId, quantity) => request(`/cart/item/${itemId}`, { method: 'PUT', body: { quantity } }),
  removeCartItem: (itemId) => request(`/cart/item/${itemId}`, { method: 'DELETE' }),
  applyCoupon: (code) => request('/cart/coupon', { method: 'POST', body: { code } }),
  removeCoupon: () => request('/cart/coupon', { method: 'DELETE' }),

  // Orders & Checkout
  checkout: (body) => request('/orders/checkout', { method: 'POST', body }),
  verifyPayment: (body) => request('/orders/verify-payment', { method: 'POST', body }),
  getMyOrders: () => request('/orders/my-orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  trackOrder: (body) => request('/orders/track', { method: 'POST', body }),

  // Reviews
  createReview: (body) => request('/reviews', { method: 'POST', body }),

  // CMS, Inquiries & Editorial
  getPageBySlug: (slug) => request(`/cms/page/${slug}`),
  getJournalArticles: () => request('/cms/journal'),
  getJournalArticleBySlug: (slug) => request(`/cms/journal/${slug}`),
  submitContactInquiry: (body) => request('/cms/contact', { method: 'POST', body }),
  getNavigationMenus: () => request('/navigation'),

  // Offers & Public Coupons
  getPublicOffers: () => request('/coupons/public'),

  // Store Settings & Newsletter
  getPublicSettings: () => request('/settings/public'),
  subscribeNewsletter: (body) => request('/settings/newsletter', { method: 'POST', body }),

  // ADMIN CMS ENDPOINTS
  // Dashboard Analytics
  getAdminAnalytics: (range = '30d') => request(`/analytics/dashboard?range=${range}`),

  // Homepage Visual CMS Editor
  adminGetSections: () => request('/homepage/admin/sections'),
  adminGetSectionById: (id) => request(`/homepage/admin/sections/${id}`),
  adminCreateSection: (body) => request('/homepage/admin/sections', { method: 'POST', body }),
  adminUpdateSection: (id, body) => request(`/homepage/admin/sections/${id}`, { method: 'PUT', body }),
  adminReorderSections: (orderedIds) => request('/homepage/admin/sections/reorder', { method: 'PUT', body: { orderedIds } }),
  adminToggleSection: (id) => request(`/homepage/admin/sections/${id}/toggle`, { method: 'PATCH' }),
  adminDeleteSection: (id) => request(`/homepage/admin/sections/${id}`, { method: 'DELETE' }),

  // Products & Variants Manager
  adminCreateProduct: (body) => request('/products', { method: 'POST', body }),
  adminUpdateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  adminDeleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  adminCreateVariant: (productId, body) => request(`/products/${productId}/variants`, { method: 'POST', body }),
  adminUpdateVariant: (variantId, body) => request(`/products/variants/${variantId}`, { method: 'PUT', body }),
  adminDeleteVariant: (variantId) => request(`/products/variants/${variantId}`, { method: 'DELETE' }),

  // Categories & Collections
  adminGetCategories: () => request('/catalog/categories/admin/all'),
  adminCreateCategory: (body) => request('/catalog/categories', { method: 'POST', body }),
  adminUpdateCategory: (id, body) => request(`/catalog/categories/${id}`, { method: 'PUT', body }),
  adminDeleteCategory: (id) => request(`/catalog/categories/${id}`, { method: 'DELETE' }),

  adminGetCollections: () => request('/catalog/collections/admin/all'),
  adminCreateCollection: (body) => request('/catalog/collections', { method: 'POST', body }),
  adminUpdateCollection: (id, body) => request(`/catalog/collections/${id}`, { method: 'PUT', body }),
  adminDeleteCollection: (id) => request(`/catalog/collections/${id}`, { method: 'DELETE' }),

  // Orders Fulfillment
  adminGetOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders/admin/all${qs ? `?${qs}` : ''}`);
  },
  adminUpdateOrderStatus: (id, body) => request(`/orders/admin/${id}/status`, { method: 'PUT', body }),
  adminCancelOrder: (id, body) => request(`/orders/admin/${id}/cancel`, { method: 'PUT', body }),

  // Inventory Tracker
  adminGetInventory: (threshold = 5) => request(`/inventory/overview?threshold=${threshold}`),
  adminAdjustStock: (body) => request('/inventory/adjust', { method: 'POST', body }),
  adminGetInventoryMovements: () => request('/inventory/movements'),

  // Media Library
  adminGetMedia: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/media${qs ? `?${qs}` : ''}`);
  },
  adminUploadMedia: (formData) => request('/media/upload', { method: 'POST', body: formData, isFormData: true }),
  adminDeleteMedia: (id) => request(`/media/${id}`, { method: 'DELETE' }),

  // Coupons Manager
  adminGetCoupons: () => request('/coupons/admin/all'),
  adminCreateCoupon: (body) => request('/coupons/admin', { method: 'POST', body }),
  adminUpdateCoupon: (id, body) => request(`/coupons/admin/${id}`, { method: 'PUT', body }),
  adminDeleteCoupon: (id) => request(`/coupons/admin/${id}`, { method: 'DELETE' }),

  // Reviews Moderation
  adminGetReviews: () => request('/reviews/admin/all'),
  adminUpdateReview: (id, body) => request(`/reviews/admin/${id}`, { method: 'PUT', body }),
  adminDeleteReview: (id) => request(`/reviews/admin/${id}`, { method: 'DELETE' }),

  // CMS Pages
  adminGetPages: () => request('/cms/admin/all'),
  adminCreatePage: (body) => request('/cms/admin', { method: 'POST', body }),
  adminUpdatePage: (id, body) => request(`/cms/admin/${id}`, { method: 'PUT', body }),
  adminDeletePage: (id) => request(`/cms/admin/${id}`, { method: 'DELETE' }),

  // Navigation Menus
  adminGetMenus: () => request('/navigation/admin/all'),
  adminUpdateMenu: (menuKey, body) => request(`/navigation/admin/${menuKey}`, { method: 'PUT', body }),

  // Customers CRM
  adminGetUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/auth/admin/users${qs ? `?${qs}` : ''}`);
  },
  adminUpdateUserRole: (id, body) => request(`/auth/admin/users/${id}/role`, { method: 'PUT', body }),

  // Store Settings & Audit Logs
  adminGetSettings: () => request('/settings/admin'),
  adminUpdateSettings: (body) => request('/settings/admin', { method: 'PUT', body }),
  adminGetSubscribers: () => request('/settings/subscribers'),
  adminGetAuditLogs: () => request('/settings/audit-logs'),
};
