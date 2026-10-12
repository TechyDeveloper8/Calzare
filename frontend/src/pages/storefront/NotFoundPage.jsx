import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home, ShoppingBag, Truck } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '600px' }}>
        <span
          style={{
            background: 'var(--accent-lime)',
            color: 'var(--ink-black)',
            fontWeight: 800,
            fontSize: '0.85rem',
            padding: '6px 16px',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'inline-block',
            marginBottom: '20px',
          }}
        >
          LOST IN TRANSIT // 404
        </span>

        <h1
          style={{
            fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            fontWeight: 800,
            marginBottom: '16px',
          }}
        >
          OFF THE GRID
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '36px',
          }}
        >
          The silhouette, page, or link you followed has been archived, moved, or never existed on this pavement.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/"
            className="btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Home size={18} /> Return Home
          </Link>

          <Link
            to="/shop"
            className="btn-secondary"
            style={{
              padding: '14px 28px',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShoppingBag size={18} /> Explore Drops
          </Link>

          <Link
            to="/track-order"
            className="btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Truck size={18} /> Track Order
          </Link>
        </div>
      </div>
    </div>
  );
};
