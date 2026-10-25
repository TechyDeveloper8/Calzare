import React from 'react';
import { X, Check } from 'lucide-react';

export const SizeGuideModal = ({ isOpen, onClose, sizeChart, sizeGuideConfig }) => {
  if (!isOpen) return null;

  const title = sizeGuideConfig?.title || sizeChart?.title || 'OFFICIAL SIZE GUIDE';
  const instructions =
    sizeGuideConfig?.instructions ||
    'CALZARE clogs and slides fit true to size. If you normally wear half sizes (e.g. UK 7.5), we recommend sizing UP to UK 8 for comfortable arch relaxation.';
  const unit = sizeGuideConfig?.measurementUnit || 'cm';

  const defaultRows = [
    { uk: 'UK 5', eu: 'EU 38', us: 'US 6', footLengthCm: 24.2 },
    { uk: 'UK 6', eu: 'EU 39', us: 'US 7', footLengthCm: 25.0 },
    { uk: 'UK 7', eu: 'EU 41', us: 'US 8', footLengthCm: 25.8 },
    { uk: 'UK 8', eu: 'EU 42', us: 'US 9', footLengthCm: 26.6 },
    { uk: 'UK 9', eu: 'EU 43', us: 'US 10', footLengthCm: 27.5 },
    { uk: 'UK 10', eu: 'EU 45', us: 'US 11', footLengthCm: 28.3 },
    { uk: 'UK 11', eu: 'EU 46', us: 'US 12', footLengthCm: 29.1 },
  ];

  const rows = sizeChart?.measurements?.length ? sizeChart.measurements : defaultRows;

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
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {title}
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Standard Indian / UK Footwear Measurements
            </span>
          </div>
          <button onClick={onClose} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '24px', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f5f3ee', borderBottom: '2px solid var(--border-light)' }}>
              <th style={{ padding: '10px 14px' }}>UK / INDIA</th>
              <th style={{ padding: '10px 14px' }}>EU</th>
              <th style={{ padding: '10px 14px' }}>US</th>
              <th style={{ padding: '10px 14px' }}>FOOT LENGTH</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 800 }}>{row.uk}</td>
                <td style={{ padding: '12px 14px' }}>{row.eu || '—'}</td>
                <td style={{ padding: '12px 14px' }}>{row.us || row.usM || '—'}</td>
                <td style={{ padding: '12px 14px', color: '#166534', fontWeight: 700 }}>
                  {row.footLengthCm || row.cm} {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ background: '#faf9f6', padding: '16px', borderRadius: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 700, color: 'var(--ink-black)', marginBottom: '4px' }}>💡 Fitting & Measurement Advice</div>
          {instructions}
        </div>
      </div>
    </div>
  );
};
