import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { StoreConfigProvider } from './context/StoreConfigContext.jsx';

// Common Storefront Shell Components
import { AnnouncementBar } from './components/common/AnnouncementBar.jsx';
import { Header } from './components/common/Header.jsx';
import { Footer } from './components/common/Footer.jsx';
import { CartDrawer } from './components/common/CartDrawer.jsx';
import { SearchModal } from './components/common/SearchModal.jsx';

// Storefront Pages
import { HomePage } from './pages/storefront/HomePage.jsx';
import { ShopPage } from './pages/storefront/ShopPage.jsx';
import { CollectionPage } from './pages/storefront/CollectionPage.jsx';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage.jsx';
import { CartPage } from './pages/storefront/CartPage.jsx';
import { CheckoutPage } from './pages/storefront/CheckoutPage.jsx';
import { OrderSuccessPage } from './pages/storefront/OrderSuccessPage.jsx';
import { AccountPage } from './pages/storefront/AccountPage.jsx';
import { WishlistPage } from './pages/storefront/WishlistPage.jsx';
import { LoginPage } from './pages/storefront/LoginPage.jsx';
import { RegisterPage } from './pages/storefront/RegisterPage.jsx';
import { CmsContentPage } from './pages/storefront/CmsContentPage.jsx';
import { TrackOrderPage } from './pages/storefront/TrackOrderPage.jsx';
import { ContactPage } from './pages/storefront/ContactPage.jsx';
import { FaqPage } from './pages/storefront/FaqPage.jsx';
import { AboutPage } from './pages/storefront/AboutPage.jsx';
import { OffersPage } from './pages/storefront/OffersPage.jsx';
import { JournalPage } from './pages/storefront/JournalPage.jsx';
import { JournalDetailPage } from './pages/storefront/JournalDetailPage.jsx';
import { SearchPage } from './pages/storefront/SearchPage.jsx';
import { NotFoundPage } from './pages/storefront/NotFoundPage.jsx';

// Admin CMS Shell & Pages
import { AdminLayout } from './components/admin/AdminLayout.jsx';
import { AdminLogin } from './pages/admin/AdminLogin.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminHomepageEditor } from './pages/admin/AdminHomepageEditor.jsx';
import { AdminProducts } from './pages/admin/AdminProducts.jsx';
import { AdminProductForm } from './pages/admin/AdminProductForm.jsx';
import { AdminCollections } from './pages/admin/AdminCollections.jsx';
import { AdminOrders } from './pages/admin/AdminOrders.jsx';
import { AdminInventory } from './pages/admin/AdminInventory.jsx';
import { AdminMediaManager } from './pages/admin/AdminMediaManager.jsx';
import { AdminCoupons } from './pages/admin/AdminCoupons.jsx';
import { AdminReviews } from './pages/admin/AdminReviews.jsx';
import { AdminPages } from './pages/admin/AdminPages.jsx';
import { AdminNavigation } from './pages/admin/AdminNavigation.jsx';
import { AdminCustomers } from './pages/admin/AdminCustomers.jsx';
import { AdminSettings } from './pages/admin/AdminSettings.jsx';

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

  return (
    <div className="storefront-app-shell">
      <AnnouncementBar />
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main className="storefront-main-content">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
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
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/journal/:slug" element={<JournalDetailPage />} />
                  <Route path="/shipping" element={<CmsContentPage slug="shipping" />} />
                  <Route path="/returns" element={<CmsContentPage slug="returns" />} />
                  <Route path="/refund-policy" element={<CmsContentPage slug="refund-policy" />} />
                  <Route path="/privacy" element={<CmsContentPage slug="privacy" />} />
                  <Route path="/terms" element={<CmsContentPage slug="terms" />} />
                  <Route path="/size-guide" element={<CmsContentPage slug="size-guide" />} />
                  <Route path="/page/:slug" element={<CmsContentPage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                </Route>

                {/* Admin CMS Authentication */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin CMS Protected Control Center */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="homepage" element={<AdminHomepageEditor />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/edit/:id" element={<AdminProductForm />} />
                  <Route path="collections" element={<AdminCollections />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="media" element={<AdminMediaManager />} />
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
            </WishlistProvider>
          </CartProvider>
        </StoreConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

