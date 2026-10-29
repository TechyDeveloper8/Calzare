import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/api.js';
import { Plus, Edit, Trash2, Search, ExternalLink, Loader2, Package, RefreshCw } from 'lucide-react';

export const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = { limit: 50 };
      if (searchTerm) query.search = searchTerm;
      if (audienceFilter) query.audience = audienceFilter;
      const res = await api.getProducts(query);
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, audienceFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete product "${name}"?`)) return;
    try {
      const res = await api.adminDeleteProduct(id);
      alert(res.message);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
            Products & Catalog
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Manage footwear models, multi-color galleries, SKUs, and UK size stock matrices.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="admin-btn admin-btn-primary"
          style={{ fontSize: '0.8rem', padding: '8px 14px' }}
        >
          <Plus size={15} /> Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 320px' }}>
            <input
              type="text"
              placeholder="Search by product title, SKU prefix, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: '34px', fontSize: '0.82rem' }}
            />
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="admin-select"
              style={{ fontSize: '0.82rem', padding: '7px 12px', minWidth: '140px' }}
            >
              <option value="">All Audiences</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Unisex">Unisex</option>
            </select>

            <button
              onClick={fetchProducts}
              className="admin-btn admin-btn-outline"
              style={{ fontSize: '0.78rem', padding: '7px 10px' }}
              title="Refresh Catalog"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Products High-Density Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
            Loading product catalog...
          </div>
        ) : products.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Master SKU</th>
                  <th>Audience</th>
                  <th>Base Price</th>
                  <th>Colorways</th>
                  <th>Catalog Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = p.defaultImages?.[0]?.url || p.variants?.[0]?.images?.[0]?.url;
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={img}
                            alt=""
                            style={{
                              width: '40px',
                              height: '42px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {p.productType} • {p.category?.name || 'General Footwear'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="corp-code" style={{ fontSize: '0.75rem' }}>{p.sku}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 500,
                            padding: '2px 8px',
                            background: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {p.audience}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', fontVariantNumeric: 'tabular-nums' }}>
                          ₹{p.baseSalePrice?.toLocaleString('en-IN')}
                        </div>
                        {p.baseRegularPrice > p.baseSalePrice && (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{p.baseRegularPrice?.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          {p.variants?.slice(0, 4).map((v, i) => (
                            <div
                              key={i}
                              title={v.colorName}
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: v.colorHex,
                                border: '1px solid #cbd5e1',
                              }}
                            />
                          ))}
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginLeft: '2px' }}>
                            ({p.variants?.length || 0})
                          </span>
                        </div>
                      </td>
                      <td>
                        {p.status === 'published' ? (
                          <span className="corp-pill corp-pill-success">
                            <span className="corp-pill-dot" /> Published
                          </span>
                        ) : (
                          <span className="corp-pill corp-pill-neutral">
                            <span className="corp-pill-dot" /> {p.status || 'Draft'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                            title="Preview on Storefront"
                          >
                            <ExternalLink size={13} />
                          </Link>
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            className="admin-btn admin-btn-outline"
                            style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                            title="Edit Product & Variants"
                          >
                            <Edit size={13} />
                          </Link>
                          <button
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                            onClick={() => handleDelete(p._id, p.name)}
                            title="Delete or Archive Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '56px 20px', textAlign: 'center' }}>
            <Package size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>
              No products found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
              Try searching with a different term or clear your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
