import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    discount: 0,
    coupon: null,
    shippingFee: 0,
    total: 0,
    freeShippingThreshold: 999,
    freeShippingDelta: 999,
  });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartAlert, setCartAlert] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.cart) {
        setCart(res.cart);
        if (res.stockAlerts && res.stockAlerts.length > 0) {
          setCartAlert(res.stockAlerts.join(' '));
        }
      }
    } catch (err) {
      console.warn('Could not fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, variantId, size, quantity = 1) => {
    try {
      setLoading(true);
      const res = await api.addToCart({
        productId,
        variantId,
        size,
        quantity,
        sessionId: localStorage.getItem('calzare_session_id'),
      });
      if (res.success && res.cart) {
        setCart(res.cart);
        setIsCartOpen(true);
        if (res.stockAlerts?.length) setCartAlert(res.stockAlerts.join(' '));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.updateCartItem(itemId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.removeCartItem(itemId);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.applyCoupon(code);
      if (res.success && res.cart) {
        setCart(res.cart);
        return { success: true, message: 'Coupon applied successfully!' };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await api.removeCoupon();
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalItemsCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        cartAlert,
        setCartAlert,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
