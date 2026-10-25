import React, { useState, useEffect } from 'react';
import { Star, Droplets, Truck, RotateCcw, ShieldCheck, Zap, Sparkles } from 'lucide-react';

const iconMap = {
  Star,
  Droplets,
  Truck,
  RotateCcw,
  ShieldCheck,
  Zap,
  Sparkles,
};

export const TrustTickerSection = ({ section }) => {
  const config = section.config || {};
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const messages = config.tickerMessages || [
    { text: '100% WATERPROOF CLOSED-CELL INJECTION FOAM', highlight: 'WEATHER-PROOF', iconName: 'Droplets' },
    { text: 'FREE EXPRESS SHIPPING ACROSS INDIA OVER ₹999', highlight: 'FAST DISPATCH', iconName: 'Truck' },
    { text: '7-DAY DOORSTEP SIZE EXCHANGE & REPLACEMENTS', highlight: 'EASY RETURNS', iconName: 'RotateCcw' },
    { text: 'ORTHOPEDIC ARCH RELIEF & REBOUND SUPPORT', highlight: 'COMFORT LAB', iconName: 'Zap' },
    { text: 'DIRECT FROM INNOVATION LAB — NO MIDDLEMAN MARKUPS', highlight: 'HONEST PRICING', iconName: 'ShieldCheck' },
  ];

  // Duplicate messages to create continuous loop
  const repeatedMessages = [...messages, ...messages, ...messages];

  return (
    <div
      role="region"
      aria-label="Brand Benefits and Guarantees"
      className="trust-ticker-section"
      style={{
        backgroundColor: config.backgroundTreatment === 'ink_black' ? '#0f0f10' : '#18181b',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div
        className="ticker-track"
        style={{
          animationDuration: `${config.tickerSpeed || 28}s`,
          animationDirection: config.tickerDirection === 'right' ? 'reverse' : 'normal',
          animationPlayState: prefersReducedMotion ? 'paused' : undefined,
          display: 'flex',
          width: 'max-content',
        }}
      >
        {repeatedMessages.map((msg, idx) => {
          const IconComp = iconMap[msg.iconName] || Zap;
          return (
            <div key={idx} className="ticker-item">
              <IconComp size={15} color="var(--accent-lime)" />
              <span>{msg.text}</span>
              {msg.highlight && <span className="ticker-highlight">• {msg.highlight}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
