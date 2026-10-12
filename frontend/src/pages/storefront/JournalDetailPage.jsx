import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  ShoppingBag,
  Loader2,
  Tag,
} from 'lucide-react';

export const JournalDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await api.getJournalArticleBySlug(slug);
        if (res.success && res.article) {
          setArticle(res.article);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Editorial Story Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          This journal story may have been archived or moved.
        </p>
        <Link to="/journal" className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Back Link */}
        <Link
          to="/journal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '32px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to All Stories
        </Link>

        {/* Story Metadata */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {(article.tags || ['Editorial']).map((t, i) => (
              <span
                key={i}
                style={{
                  background: 'var(--surface-cream)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--ink-black)',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}
          >
            {article.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              borderBottom: '1px solid rgba(15,15,16,0.08)',
              paddingBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>
                By <strong>{article.author || 'CALZARE Editorial'}</strong>
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {article.readTime || '4 min read'}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {new Date(article.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '999px',
                background: copied ? '#f0fdf4' : 'var(--surface-cream)',
                border: '1px solid rgba(15,15,16,0.1)',
                color: copied ? '#166534' : 'var(--ink-black)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copied ? (
                <>
                  <Check size={14} /> Link Copied
                </>
              ) : (
                <>
                  <Share2 size={14} /> Share Story
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Imagery */}
        {article.heroImage && (
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              marginBottom: '40px',
              maxHeight: '480px',
              boxShadow: '0 16px 36px rgba(0,0,0,0.06)',
            }}
          >
            <img
              src={article.heroImage}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Article Body Content */}
        <div
          className="glass-panel"
          style={{
            padding: '48px',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            boxShadow: '0 20px 48px rgba(0,0,0,0.03)',
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--text-secondary)',
            marginBottom: '60px',
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* CTA Footer */}
        <div
          style={{
            padding: '36px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--surface-cream)',
            border: '1px solid rgba(15,15,16,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Step into the story</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Experience the dual-density closed-cell clogs and slides featured above.
            </p>
          </div>

          <Link
            to="/shop"
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            Shop the Collection <ShoppingBag size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
