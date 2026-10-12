import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api.js';

const StoreConfigContext = createContext();

export const StoreConfigProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'CALZARE',
    tagline: 'Good Shoes. Loud Personality.',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    themeTokens: {
      primaryAccent: '#d8ff00',
      secondaryAccent: '#ff5d2b',
      darkCanvas: '#0f0f10',
      lightCanvas: '#f8f6f0',
      glassmorphismIntensity: 'subtle',
    },
  });
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshConfig = async () => {
    try {
      const [settingsRes, menusRes] = await Promise.all([api.getPublicSettings(), api.getNavigationMenus()]);
      if (settingsRes.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
      }
      if (menusRes.success && menusRes.menus) {
        setMenus(menusRes.menus);
      }
    } catch (err) {
      console.warn('Could not load store config:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  return (
    <StoreConfigContext.Provider
      value={{
        settings,
        menus,
        loading,
        refreshConfig,
      }}
    >
      {children}
    </StoreConfigContext.Provider>
  );
};

export const useStoreConfig = () => useContext(StoreConfigContext);
