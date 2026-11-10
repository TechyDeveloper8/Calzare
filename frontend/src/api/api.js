const rawApiRoot =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.API_URL ||
  '';
const API_BASE = rawApiRoot
  ? `${rawApiRoot.replace(/\/+$/, '').replace(/\/api\/v1$/, '')}/api/v1`
  : '/api/v1';

/**
 * Universal Asset URL Formatter
 * Converts relative upload paths (e.g. /uploads/image.jpg) into authoritative absolute URLs
 * pointing to the backend host (Render or local backend server).
 */
export const getAssetUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Public static assets hosted on frontend client (e.g. /images/..., /favicon, /icons)
  if (
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('images/') ||
    trimmed.startsWith('/favicon') ||
    trimmed.startsWith('/icons')
  ) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  const backendHost = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  )
    .replace(/\/+$/, '')
    .replace(/\/api(\/v1)?\/?$/, '');

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendHost}${normalizedPath}`;
};

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

// In-memory client cache with TTL to eliminate latency on tab/route switching
const clientCache = new Map();
const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds

export const clearClientCache = () => {
  clientCache.clear();
};

const cachedGet = async (endpoint, ttlMs = DEFAULT_TTL_MS) => {
  const cached = clientCache.get(endpoint);
  const now = Date.now();
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }
  const data = await request(endpoint);
  clientCache.set(endpoint, { data, timestamp: now });
  return data;
};

// Generic mutation wrapper that automatically invalidates cached data
const mutate = async (endpoint, options = {}) => {
  const result = await request(endpoint, options);
  clearClientCache();
  return result;
};

export const api = {
  // Client Cache Invalidation
  clearCache: clearClientCache,

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
  checkDelivery: (pincode) => request(`/products/check-delivery/${encodeURIComponent(pincode)}`),
  checkDeliveryPincode: (pincode) => request(`/products/check-delivery/${encodeURIComponent(pincode)}`),
  searchProducts: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
  getCategories: () => cachedGet('/catalog/categories'),
  getCollections: () => cachedGet('/catalog/collections'),
  getCollectionBySlug: (slug) => cachedGet(`/catalog/collections/${slug}`),

  // Homepage
  getHomepage: () => cachedGet('/homepage', 30 * 1000),

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
  createReview: (body) => mutate('/reviews', { method: 'POST', body }),

  // CMS, Inquiries & Editorial
  getPageBySlug: (slug) => cachedGet(`/cms/page/${slug}`, 60 * 1000),
  getJournalArticles: () => cachedGet('/cms/journal', 60 * 1000),
  getJournalArticleBySlug: (slug) => cachedGet(`/cms/journal/${slug}`, 60 * 1000),
  submitContactInquiry: (body) => request('/cms/contact', { method: 'POST', body }),
  getNavigationMenus: () => cachedGet('/navigation', 60 * 1000),
  getStoryPage: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return cachedGet(`/story${qs ? `?${qs}` : ''}`, 60 * 1000);
  },

  // Offers & Public Coupons
  getPublicOffers: () => cachedGet('/coupons/public', 60 * 1000),

  // Store Settings & Newsletter
  getPublicSettings: () => cachedGet('/settings/public', 60 * 1000),
  subscribeNewsletter: (body) => request('/settings/newsletter', { method: 'POST', body }),

  // ADMIN CMS ENDPOINTS
  // Dashboard Analytics
  getAdminAnalytics: (range = '30d') => request(`/analytics/dashboard?range=${range}`),

  // Homepage Visual CMS Editor
  adminGetSections: () => request('/homepage/admin/sections'),
  adminGetSectionById: (id) => request(`/homepage/admin/sections/${id}`),
  adminCreateSection: (body) => mutate('/homepage/admin/sections', { method: 'POST', body }),
  adminUpdateSection: (id, body) => mutate(`/homepage/admin/sections/${id}`, { method: 'PUT', body }),
  adminReorderSections: (orderedIds) => mutate('/homepage/admin/sections/reorder', { method: 'PUT', body: { orderedIds } }),
  adminToggleSection: (id) => mutate(`/homepage/admin/sections/${id}/toggle`, { method: 'PATCH' }),
  adminDeleteSection: (id) => mutate(`/homepage/admin/sections/${id}`, { method: 'DELETE' }),

  // Products & Variants Manager
  adminGetProductById: (id) => request(`/products/admin/${id}`),
  adminCreateProduct: (body) => mutate('/products', { method: 'POST', body }),
  adminUpdateProduct: (id, body) => mutate(`/products/${id}`, { method: 'PUT', body }),
  adminDeleteProduct: (id) => mutate(`/products/${id}`, { method: 'DELETE' }),
  adminCreateVariant: (productId, body) => mutate(`/products/${productId}/variants`, { method: 'POST', body }),
  adminUpdateVariant: (variantId, body) => mutate(`/products/variants/${variantId}`, { method: 'PUT', body }),
  adminDeleteVariant: (variantId) => mutate(`/products/variants/${variantId}`, { method: 'DELETE' }),

  // Categories & Collections
  adminGetCategories: () => request('/catalog/categories/admin/all'),
  adminCreateCategory: (body) => mutate('/catalog/categories', { method: 'POST', body }),
  adminUpdateCategory: (id, body) => mutate(`/catalog/categories/${id}`, { method: 'PUT', body }),
  adminDeleteCategory: (id) => mutate(`/catalog/categories/${id}`, { method: 'DELETE' }),

  adminGetCollections: () => request('/catalog/collections/admin/all'),
  adminInitCoreCollections: () => mutate('/catalog/collections/init-defaults', { method: 'POST' }),
  adminCreateCollection: (body) => mutate('/catalog/collections', { method: 'POST', body }),
  adminUpdateCollection: (id, body) => mutate(`/catalog/collections/${id}`, { method: 'PUT', body }),
  adminDeleteCollection: (id) => mutate(`/catalog/collections/${id}`, { method: 'DELETE' }),

  // Orders Fulfillment
  adminGetOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders/admin/all${qs ? `?${qs}` : ''}`);
  },
  adminUpdateOrderStatus: (id, body) => request(`/orders/admin/${id}/status`, { method: 'PUT', body }),
  adminShipWithFShip: (id) => request(`/orders/admin/${id}/fship-ship`, { method: 'POST' }),
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

  // Reviews Moderation & Management
  adminGetReviews: () => request('/reviews/admin/all'),
  adminCreateReview: (body) => request('/reviews/admin', { method: 'POST', body }),
  adminUpdateReview: (id, body) => request(`/reviews/admin/${id}`, { method: 'PUT', body }),
  adminDeleteReview: (id) => request(`/reviews/admin/${id}`, { method: 'DELETE' }),

  // CMS Pages
  adminGetPages: () => request('/cms/admin/all'),
  adminCreatePage: (body) => mutate('/cms/admin', { method: 'POST', body }),
  adminUpdatePage: (id, body) => mutate(`/cms/admin/${id}`, { method: 'PUT', body }),
  adminDeletePage: (id) => mutate(`/cms/admin/${id}`, { method: 'DELETE' }),

  // Our Story CMS Manager
  adminGetStoryPage: (slug = 'about-us') => request(`/story/admin?slug=${encodeURIComponent(slug)}`),
  adminUpdateStoryPage: (body, slug = 'about-us') => mutate(`/story/admin?slug=${encodeURIComponent(slug)}`, { method: 'PUT', body }),
  adminAddStorySection: (body, slug = 'about-us') => mutate(`/story/admin/sections?slug=${encodeURIComponent(slug)}`, { method: 'POST', body }),
  adminDuplicateStorySection: (sectionId, slug = 'about-us') => mutate(`/story/admin/sections/${sectionId}/duplicate?slug=${encodeURIComponent(slug)}`, { method: 'POST' }),
  adminDeleteStorySection: (sectionId, slug = 'about-us') => mutate(`/story/admin/sections/${sectionId}?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  adminReorderStorySections: (orderedIds, slug = 'about-us') => mutate(`/story/admin/sections/reorder?slug=${encodeURIComponent(slug)}`, { method: 'PUT', body: { orderedIds } }),
  adminToggleStorySection: (sectionId, slug = 'about-us') => mutate(`/story/admin/sections/${sectionId}/toggle?slug=${encodeURIComponent(slug)}`, { method: 'PATCH' }),
  adminPublishStoryPage: (slug = 'about-us') => mutate(`/story/admin/publish?slug=${encodeURIComponent(slug)}`, { method: 'POST' }),
  adminUnpublishStoryPage: (slug = 'about-us') => mutate(`/story/admin/unpublish?slug=${encodeURIComponent(slug)}`, { method: 'POST' }),

  // Navigation Menus
  adminGetMenus: () => request('/navigation/admin/all'),
  adminUpdateMenu: (menuKey, body) => mutate(`/navigation/admin/${menuKey}`, { method: 'PUT', body }),

  // Customers CRM & Security
  adminGetUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/auth/admin/users${qs ? `?${qs}` : ''}`);
  },
  adminUpdateUserRole: (id, body) => request(`/auth/admin/users/${id}/role`, { method: 'PUT', body }),
  adminToggleUserStatus: (id) => request(`/auth/admin/users/${id}/status`, { method: 'PUT' }),
  adminGetSecurityMetrics: () => request('/auth/admin/security-status'),

  // Store Settings & Audit Logs
  adminGetSettings: () => request('/settings/admin'),
  adminUpdateSettings: (body) => mutate('/settings/admin', { method: 'PUT', body }),
  adminTestFshipConnection: (body) => request('/settings/admin/test-fship', { method: 'POST', body }),
  adminGetSubscribers: () => request('/settings/subscribers'),
  adminGetAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/settings/audit-logs${qs ? `?${qs}` : ''}`);
  },
};
