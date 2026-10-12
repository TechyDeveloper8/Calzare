import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import { Loader2, ArrowLeft } from 'lucide-react';

export const CmsContentPage = ({ slug: propSlug }) => {
  const params = useParams();
  const targetSlug = propSlug || params.slug;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await api.getPageBySlug(targetSlug);
        if (res.success && res.page) {
          setPage(res.page);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (targetSlug) fetchPage();
  }, [targetSlug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Page Not Found</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0 120px' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '32px',
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <span className="section-eyebrow">{page.category?.toUpperCase()} // CALZARE</span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', marginBottom: '32px' }}>{page.title}</h1>

        <div
          className="glass-panel"
          style={{
            padding: '40px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            fontSize: '1.02rem',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
          }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};
