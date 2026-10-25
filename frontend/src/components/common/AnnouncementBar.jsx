import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStoreConfig } from '../../context/StoreConfigContext.jsx';

export const AnnouncementBar = () => {
  const { menus, settings } = useStoreConfig();
  const announcementMenu = menus?.announcement_bar;

  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('calzare_announcement_dismissed') === 'true';
  });
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derive promotions from admin navigation or dynamic store setting
  const threshold = settings?.freeShippingThreshold || 999;
  const rawItems = announcementMenu?.items?.length
    ? announcementMenu.items
    : [
        { label: `FREE EXPRESS SHIPPING ACROSS INDIA ON ORDERS OVER ₹${threshold}`, url: '/shop', badge: 'SHIPPING' },
        { label: 'SCULPTED DUAL-DENSITY ARCHITECTURAL FOAM FOOTWEAR', url: '/shop', badge: 'INNOVATION' },
        { label: '7-DAY DOORSTEP SIZE EXCHANGE ON ALL SILHOUETTES', url: '/returns', badge: 'ASSURANCE' },
      ];

  const items = rawItems.filter((item) => item.label && item.label.trim().length > 0);

  useEffect(() => {
    if (!items || items.length <= 1 || isPaused) return;
    const intervalSec = (announcementMenu?.metadata?.rotationIntervalSec || 4.5) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, intervalSec);
    return () => clearInterval(timer);
  }, [items, announcementMenu, isPaused]);

  if (dismissed || announcementMenu?.isActive === false) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('calzare_announcement_dismissed', 'true');
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const currentItem = items[currentIndex] || items[0];

  return (
    <div
      role="region"
      aria-label="Promotional Announcement"
      className="announcement-bar"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{
        backgroundColor: announcementMenu?.metadata?.bgColor || 'var(--ink-black)',
        color: announcementMenu?.metadata?.textColor || '#ffffff',
        position: 'relative',
        zIndex: 120,
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '36px' }}>
        {items.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              marginRight: '8px',
            }}
            aria-label="Previous announcement"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        <Link
          to={currentItem.url || '/shop'}
          className="announcement-content"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {currentItem.badge && (
            <span className="announcement-badge" style={{ backgroundColor: 'var(--accent-lime)', color: '#0f0f10' }}>
              {currentItem.badge}
            </span>
          )}
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.04em', fontWeight: 600 }}>
            {currentItem.label}
          </span>
        </Link>

        {items.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '8px',
            }}
            aria-label="Next announcement"
          >
            <ChevronRight size={14} />
          </button>
        )}

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Dismiss announcement"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
