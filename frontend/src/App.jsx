import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { StoreConfigProvider } from './context/StoreConfigContext.jsx';

// Common Storefront Shell Components (Loaded synchronously for instant header/footer/cart)
import { AnnouncementBar } from './components/common/AnnouncementBar.jsx';
import { Header } from './components/common/Header.jsx';
import { Footer } from './components/common/Footer.jsx';
import { CartDrawer } from './components/common/CartDrawer.jsx';
import { SearchModal } from './components/common/SearchModal.jsx';
import { QuickViewModal } from './components/common/QuickViewModal.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

// Lazy-Loaded Storefront Pages (Code-split for low latency & fast initial paint)
const HomePage = lazy(() => import('./pages/storefront/HomePage.jsx').then((m) => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('./pages/storefront/ShopPage.jsx').then((m) => ({ default: m.ShopPage })));
const CollectionPage = lazy(() => import('./pages/storefront/CollectionPage.jsx').then((m) => ({ default: m.CollectionPage })));
const ProductDetailPage = lazy(() => import('./pages/storefront/ProductDetailPage.jsx').then((m) => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/storefront/CartPage.jsx').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/storefront/CheckoutPage.jsx').then((m) => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./pages/storefront/OrderSuccessPage.jsx').then((m) => ({ default: m.OrderSuccessPage })));
const AccountPage = lazy(() => import('./pages/storefront/AccountPage.jsx').then((m) => ({ default: m.AccountPage })));
const WishlistPage = lazy(() => import('./pages/storefront/WishlistPage.jsx').then((m) => ({ default: m.WishlistPage })));
const LoginPage = lazy(() => import('./pages/storefront/LoginPage.jsx').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/storefront/RegisterPage.jsx').then((m) => ({ default: m.RegisterPage })));
const CmsContentPage = lazy(() => import('./pages/storefront/CmsContentPage.jsx').then((m) => ({ default: m.CmsContentPage })));
const TrackOrderPage = lazy(() => import('./pages/storefront/TrackOrderPage.jsx').then((m) => ({ default: m.TrackOrderPage })));
const ContactPage = lazy(() => import('./pages/storefront/ContactPage.jsx').then((m) => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import('./pages/storefront/FaqPage.jsx').then((m) => ({ default: m.FaqPage })));
const AboutPage = lazy(() => import('./pages/storefront/AboutPage.jsx').then((m) => ({ default: m.AboutPage })));
const OffersPage = lazy(() => import('./pages/storefront/OffersPage.jsx').then((m) => ({ default: m.OffersPage })));
const JournalPage = lazy(() => import('./pages/storefront/JournalPage.jsx').then((m) => ({ default: m.JournalPage })));
const JournalDetailPage = lazy(() => import('./pages/storefront/JournalDetailPage.jsx').then((m) => ({ default: m.JournalDetailPage })));
const SearchPage = lazy(() => import('./pages/storefront/SearchPage.jsx').then((m) => ({ default: m.SearchPage })));
const NotFoundPage = lazy(() => import('./pages/storefront/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage })));

// Lazy-Loaded Admin CMS Pages (Isolated chunks never downloaded by storefront shoppers)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx').then((m) => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx').then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx').then((m) => ({ default: m.AdminDashboard })));
const AdminHomepageEditor = lazy(() => import('./pages/admin/AdminHomepageEditor.jsx').then((m) => ({ default: m.AdminHomepageEditor })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx').then((m) => ({ default: m.AdminProducts })));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm.jsx').then((m) => ({ default: m.AdminProductForm })));
const AdminCollections = lazy(() => import('./pages/admin/AdminCollections.jsx').then((m) => ({ default: m.AdminCollections })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx').then((m) => ({ default: m.AdminOrders })));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory.jsx').then((m) => ({ default: m.AdminInventory })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons.jsx').then((m) => ({ default: m.AdminCoupons })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews.jsx').then((m) => ({ default: m.AdminReviews })));
const AdminPages = lazy(() => import('./pages/admin/AdminPages.jsx').then((m) => ({ default: m.AdminPages })));
const AdminNavigation = lazy(() => import('./pages/admin/AdminNavigation.jsx').then((m) => ({ default: m.AdminNavigation })));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers.jsx').then((m) => ({ default: m.AdminCustomers })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx').then((m) => ({ default: m.AdminSettings })));
const AdminOurStoryManager = lazy(() => import('./pages/admin/AdminOurStoryManager.jsx').then((m) => ({ default: m.AdminOurStoryManager })));

// Minimalist High-Performance Page Loader Fallback
const PageFallback = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      color: '#64748b',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}
  >
    <div
      style={{
        width: '28px',
        height: '28px',
        border: '2.5px solid #e2e8f0',
        borderTopColor: '#0f172a',
        borderRadius: '50%',
        animation: 'calzareSpin 0.6s linear infinite',
      }}
    />
    <span
      style={{
        fontSize: '0.74rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#94a3b8',
      }}
    >
      CALZARE
    </span>
    <style>{`
      @keyframes calzareSpin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Utility: Scroll to top on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Storefront Layout Wrapper
const StorefrontLayout = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <div className="storefront-app-shell">
      <AnnouncementBar />
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main className="storefront-main-content">
        <Outlet context={{ onQuickView: (p) => setQuickViewProduct(p) }} />
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreConfigProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              <ErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    {/* Storefront Routes */}
                    <Route element={<StorefrontLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/men" element={<CollectionPage preset="men" />} />
                      <Route path="/women" element={<CollectionPage preset="women" />} />
                      <Route path="/kids" element={<CollectionPage preset="kids" />} />
                      <Route path="/unisex" element={<CollectionPage preset="unisex" />} />
                      <Route path="/new-arrivals" element={<CollectionPage preset="new-arrivals" />} />
                      <Route path="/category/:slug" element={<ShopPage />} />
                      <Route path="/collection/:slug" element={<CollectionPage />} />
                      <Route path="/collections/:slug" element={<CollectionPage />} />
                      <Route path="/product/:slug" element={<ProductDetailPage />} />
                      <Route path="/products/:slug" element={<ProductDetailPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                      <Route path="/order-confirmation/:id" element={<OrderSuccessPage />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/pages/about-us" element={<AboutPage />} />
                      <Route path="/our-story" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/offers" element={<OffersPage />} />
                      <Route path="/journal" element={<JournalPage />} />
                      <Route path="/journal/:slug" element={<JournalDetailPage />} />
                      <Route path="/shipping" element={<CmsContentPage slug="shipping" />} />
                      <Route path="/shipping-policy" element={<CmsContentPage slug="shipping" />} />
                      <Route path="/returns" element={<CmsContentPage slug="returns" />} />
                      <Route path="/return-exchange-policy" element={<CmsContentPage slug="returns" />} />
                      <Route path="/refund-policy" element={<CmsContentPage slug="refund-policy" />} />
                      <Route path="/privacy" element={<CmsContentPage slug="privacy" />} />
                      <Route path="/privacy-policy" element={<CmsContentPage slug="privacy" />} />
                      <Route path="/terms" element={<CmsContentPage slug="terms" />} />
                      <Route path="/terms-and-conditions" element={<CmsContentPage slug="terms" />} />
                      <Route path="/size-guide" element={<CmsContentPage slug="size-guide" />} />
                      <Route path="/page/:slug" element={<CmsContentPage />} />
                      <Route path="/pages/:slug" element={<CmsContentPage />} />
                      <Route path="/404" element={<NotFoundPage />} />
                    </Route>

                    {/* Admin CMS Authentication */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Admin CMS Protected Control Center */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="homepage" element={<AdminHomepageEditor />} />
                      <Route path="our-story" element={<AdminOurStoryManager />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<AdminProductForm />} />
                      <Route path="products/edit/:id" element={<AdminProductForm />} />
                      <Route path="products/:id/edit" element={<AdminProductForm />} />
                      <Route path="collections" element={<AdminCollections />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="inventory" element={<AdminInventory />} />
                      <Route path="media" element={<Navigate to="/admin/products" replace />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="pages" element={<AdminPages />} />
                      <Route path="navigation" element={<AdminNavigation />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </WishlistProvider>
          </CartProvider>
        </StoreConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
