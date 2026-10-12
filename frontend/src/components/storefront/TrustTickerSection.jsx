import React from 'react';
import { Star, Droplets, Truck, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

const iconMap = {
  Star,
  Droplets,
  Truck,
  RotateCcw,
  ShieldCheck,
  Zap,
};

export const TrustTickerSection = ({ section }) => {
  const config = section.config || {};
  const messages = config.tickerMessages || [
    { text: '4.9★ RATED BY 12,000+ INDIAN WALKERS', highlight: 'VERIFIED', iconName: 'Star' },
    { text: '100% WATERPROOF CLOSED-CELL FOAM', highlight: 'MONSOON-PROOF', iconName: 'Droplets' },
    { text: 'FREE EXPRESS SHIPPING ACROSS INDIA OVER ₹999', highlight: 'FAST DISPATCH', iconName: 'Truck' },
    { text: '7-DAY HASSLE-FREE DOORSTEP SIZE EXCHANGE', highlight: 'EASY RETURNS', iconName: 'RotateCcw' },
  ];

  // Duplicate list to achieve continuous seamless loop
  const repeatedMessages = [...messages, ...messages];

  return (
    <div
      className="trust-ticker-section"
      style={{
        backgroundColor: config.backgroundTreatment === 'ink_black' ? '#0f0f10' : '#18181b',
      }}
    >
      <div
        className="ticker-track"
        style={{
          animationDuration: `${config.tickerSpeed || 28}s`,
          animationDirection: config.tickerDirection === 'right' ? 'reverse' : 'normal',
        }}
      >
        {repeatedMessages.map((msg, idx) => {
          const IconComp = iconMap[msg.iconName] || Zap;
          return (
            <div key={idx} className="ticker-item">
              <IconComp size={16} color="var(--accent-lime)" />
              <span>{msg.text}</span>
              {msg.highlight && <span className="ticker-highlight">• {msg.highlight}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
