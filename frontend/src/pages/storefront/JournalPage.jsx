import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  User,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const JournalPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await api.getJournalArticles();
        if (res.success && res.articles) {
          setArticles(res.articles);
        }
      } catch (err) {
        console.error('Failed to load journal articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container" style={{ maxWidth: '1120px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              marginTop: '8px',
            }}
          >
            THE CALZARE JOURNAL
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '16px auto 0',
              lineHeight: 1.6,
            }}
          >
            Exploring supercritical material engineering, rainy street style lookbooks, and the future of circular monolithic footwear.
          </p>
        </div>

        {/* Featured Editorial Banner */}
        {featured && (
          <div
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: '0 20px 48px rgba(0,0,0,0.05)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              marginBottom: '64px',
            }}
          >
            <div style={{ height: '100%', minHeight: '360px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={featured.heroImage || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80'}
                alt={featured.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span
                  style={{
                    background: 'var(--accent-lime)',
                    color: 'var(--ink-black)',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                  }}
                >
                  Featured Story
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {featured.readTime || '4 min read'}
                </span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                  lineHeight: 1.2,
                  marginBottom: '16px',
                  letterSpacing: '-0.02em',
                }}
              >
                <Link
                  to={`/journal/${featured.slug}`}
                  style={{ color: 'var(--ink-black)', textDecoration: 'none' }}
                >
                  {featured.title}
                </Link>
              </h2>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '24px',
                }}
              >
                {featured.excerpt}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  By <strong>{featured.author || 'CALZARE Editorial'}</strong>
                </div>

                <Link
                  to={`/journal/${featured.slug}`}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  Read Story <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Remaining Stories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {remaining.map((art, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid rgba(15,15,16,0.08)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src={art.heroImage || 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80'}
                  alt={art.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                      {art.tags?.[0] || 'Culture'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {art.readTime || '3 min read'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', lineHeight: 1.3, marginBottom: '12px', fontWeight: 800 }}>
                    <Link to={`/journal/${art.slug}`} style={{ color: 'var(--ink-black)', textDecoration: 'none' }}>
                      {art.title}
                    </Link>
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                    {art.excerpt}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(15,15,16,0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {art.author || 'CALZARE Collective'}
                  </span>
                  <Link
                    to={`/journal/${art.slug}`}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--ink-black)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Read →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
