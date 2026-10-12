import React from 'react';
import { X, Check } from 'lucide-react';

export const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          padding: '32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>OFFICIAL SIZE GUIDE</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Standard Indian / UK Footwear Measurements</span>
          </div>
          <button onClick={onClose} style={{ padding: '6px' }}>
            <X size={22} />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '24px', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f5f3ee', borderBottom: '2px solid var(--border-light)' }}>
              <th style={{ padding: '10px 14px' }}>UK / INDIA</th>
              <th style={{ padding: '10px 14px' }}>EU</th>
              <th style={{ padding: '10px 14px' }}>US MEN</th>
              <th style={{ padding: '10px 14px' }}>US WOMEN</th>
              <th style={{ padding: '10px 14px' }}>FOOT LENGTH</th>
            </tr>
          </thead>
          <tbody>
            {[
              { uk: 'UK 5', eu: 'EU 38', usM: 'US 6', usW: 'US 7', cm: '24.2 cm' },
              { uk: 'UK 6', eu: 'EU 39', usM: 'US 7', usW: 'US 8', cm: '25.0 cm' },
              { uk: 'UK 7', eu: 'EU 41', usM: 'US 8', usW: 'US 9', cm: '25.8 cm' },
              { uk: 'UK 8', eu: 'EU 42', usM: 'US 9', usW: 'US 10', cm: '26.6 cm' },
              { uk: 'UK 9', eu: 'EU 43', usM: 'US 10', usW: 'US 11', cm: '27.5 cm' },
              { uk: 'UK 10', eu: 'EU 45', usM: 'US 11', usW: 'US 12', cm: '28.3 cm' },
              { uk: 'UK 11', eu: 'EU 46', usM: 'US 12', usW: 'US 13', cm: '29.1 cm' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 800 }}>{row.uk}</td>
                <td style={{ padding: '12px 14px' }}>{row.eu}</td>
                <td style={{ padding: '12px 14px' }}>{row.usM}</td>
                <td style={{ padding: '12px 14px' }}>{row.usW}</td>
                <td style={{ padding: '12px 14px', color: '#166534', fontWeight: 700 }}>{row.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ background: '#faf9f6', padding: '16px', borderRadius: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 700, color: 'var(--ink-black)', marginBottom: '4px' }}>💡 Fitting Advice</div>
          CALZARE clogs and slides fit true to size. If you normally wear half sizes (e.g. UK 7.5), we recommend sizing <strong>UP</strong> to UK 8 for comfortable arch relaxation.
        </div>
      </div>
    </div>
  );
};
