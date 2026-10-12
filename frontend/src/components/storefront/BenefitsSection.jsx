import React from 'react';
import { Droplets, Feather, HeartHandshake, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

const iconMap = {
  Droplets,
  Feather,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Zap,
};

export const BenefitsSection = ({ section }) => {
  const config = section.config || {};
  const items = config.benefitItems || [
    {
      id: 'b1',
      iconName: 'Droplets',
      title: '100% Waterproof',
      description: 'Non-porous closed-cell EVA never absorbs water, dirt, or odors. Tap wash and wear immediately.',
    },
    {
      id: 'b2',
      iconName: 'Feather',
      title: 'Featherlight Buoyancy',
      description: 'Weighing under 280 grams per pair, experience effortless rebound that feels like stepping on soft clouds.',
    },
    {
      id: 'b3',
      iconName: 'HeartHandshake',
      title: 'Ortho-Spine Support',
      description: 'Engineered footbed contours distribute body weight evenly to protect lower back and ankles.',
    },
    {
      id: 'b4',
      iconName: 'RotateCcw',
      title: '7-Day Easy Exchange',
      description: 'Got the wrong size? Our delivery partner picks up and swaps your pair directly at your doorstep.',
    },
  ];

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container">
        <div className="section-header">
          {section.eyebrow && <span className="section-eyebrow">{section.eyebrow}</span>}
          <h2 className="section-title">{section.title || 'THE CALZARE STANDARD'}</h2>
          {section.subtitle && <p className="section-subtitle">{section.subtitle}</p>}
        </div>

        <div className="benefits-grid">
          {items.map((item, idx) => {
            const IconComp = iconMap[item.iconName] || Zap;
            return (
              <div key={idx} className="benefit-card">
                <div className="benefit-icon-box">
                  <IconComp size={24} />
                </div>
                <h3 className="benefit-title">{item.title}</h3>
                <p className="benefit-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
