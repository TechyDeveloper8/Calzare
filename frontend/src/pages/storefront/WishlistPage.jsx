import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { api } from '../../api/api.js';
import { ProductCard } from '../../components/common/ProductCard.jsx';
import { Heart, Loader2 } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.getProducts({ limit: 50 });
        if (res.success && res.products) {
          const matched = res.products.filter((p) => wishlist.includes(p._id));
          setProducts(matched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" color="var(--ink-black)" />
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0 120px' }}>
      <div className="container">
        <span className="section-eyebrow">SAVED SILHOUETTES // {wishlist.length} STYLES</span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', marginBottom: '40px' }}>YOUR WISHLIST</h1>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤍</div>
            <h3 style={{ marginBottom: '8px' }}>YOUR WISHLIST IS EMPTY</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Tap the heart icon on any footwear card to save it for later.
            </p>
            <Link to="/shop" className="btn-primary">
              EXPLORE DROPS
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
