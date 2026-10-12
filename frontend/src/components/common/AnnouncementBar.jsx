import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';

export const AnnouncementBar = () => {
  const { menus } = useStoreConfig();
  const announcementMenu = menus?.announcement_bar;
  const rawItems = announcementMenu?.items || [
    { label: '📦 FREE EXPRESS SHIPPING ON ALL PREPAID ORDERS OVER ₹999', url: '/shop', badge: 'FREE' },
    { label: '⚡ 100% WATERPROOF DUAL-DENSITY ARCHITECTURAL FOAM FOOTWEAR', url: '/shop', badge: 'FEATURED' },
  ];
  const items = rawItems.filter((item) => {
    const lbl = (item.label || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    return !lbl.includes('under ₹999 store') && !lbl.includes('drop is live') && !url.includes('under-999-store');
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const intervalSec = (announcementMenu?.metadata?.rotationIntervalSec || 4) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, intervalSec);
    return () => clearInterval(timer);
  }, [items, announcementMenu]);

  if (!announcementMenu?.isActive && announcementMenu !== undefined) return null;

  const currentItem = items[currentIndex] || items[0];

  return (
    <div
      className="announcement-bar"
      style={{
        backgroundColor: announcementMenu?.metadata?.bgColor || '#0f0f10',
        color: announcementMenu?.metadata?.textColor || '#ffffff',
      }}
    >
      <Link to={currentItem.url || '/shop'} className="announcement-content">
        {currentItem.badge && <span className="announcement-badge">{currentItem.badge}</span>}
        <span>{currentItem.label}</span>
      </Link>
    </div>
  );
};
