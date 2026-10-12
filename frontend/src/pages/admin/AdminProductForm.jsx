import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api.js';
import { Plus, Trash2, Save, ArrowLeft, Loader2, Image as ImageIcon, Layers, Tag } from 'lucide-react';

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    sku: '',
    brand: 'CALZARE',
    category: '',
    productType: 'Clogs',
    audience: 'Unisex',
    baseRegularPrice: 1499,
    baseSalePrice: 899,
    shortDescription: '',
    description: '',
    material: 'Closed-Cell High-Density EVA Foam',
    soleMaterial: 'Anti-Slip EVA Outsole',
    closureType: 'Slip-On Swivel Strap',
    weightGrams: 280,
    status: 'published',
    isFeatured: false,
    isBestseller: false,
    defaultImages: [
      {
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
        isMain: true,
      },
    ],
    // Color variants array
    initialVariants: [
      {
        colorName: 'Oat Beige',
        colorHex: '#D9CFBE',
        variantSku: '',
        regularPrice: 1499,
        salePrice: 899,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 15, sku: '' },
          { size: 'UK 7', stock: 20, sku: '' },
          { size: 'UK 8', stock: 20, sku: '' },
          { size: 'UK 9', stock: 15, sku: '' },
          { size: 'UK 10', stock: 10, sku: '' },
        ],
      },
    ],
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const catRes = await api.getCategories();
        if (catRes.success) setCategories(catRes.categories || []);

        if (isEditing) {
          const pRes = await api.getProducts({ limit: 100 });
          const target = pRes.products?.find((p) => p._id === id);
          if (target) {
            setForm({
              ...target,
              category: target.category?._id || target.category,
              initialVariants: target.variants?.length ? target.variants : form.initialVariants,
            });
          }
        } else if (catRes.categories?.length) {
          setForm((prev) => ({ ...prev, category: catRes.categories[0]._id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing]);

  const handleAddVariant = () => {
    setForm({
      ...form,
      initialVariants: [
        ...form.initialVariants,
        {
          colorName: 'New Colorway',
          colorHex: '#18181A',
          variantSku: `${form.sku || 'CALZ'}-NEW`,
          regularPrice: form.baseRegularPrice,
          salePrice: form.baseSalePrice,
          images: form.defaultImages,
          sizes: [
            { size: 'UK 6', stock: 10, sku: '' },
            { size: 'UK 7', stock: 15, sku: '' },
            { size: 'UK 8', stock: 15, sku: '' },
            { size: 'UK 9', stock: 10, sku: '' },
            { size: 'UK 10', stock: 5, sku: '' },
          ],
        },
      ],
    });
  };

  const handleRemoveVariant = (idx) => {
    setForm({
      ...form,
      initialVariants: form.initialVariants.filter((_, i) => i !== idx),
    });
  };

  const handleVariantChange = (idx, field, value) => {
    const updated = [...form.initialVariants];
    updated[idx][field] = value;
    setForm({ ...form, initialVariants: updated });
  };

  const handleSizeStockChange = (varIdx, sizeIdx, stockVal) => {
    const updated = [...form.initialVariants];
    updated[varIdx].sizes[sizeIdx].stock = Math.max(0, parseInt(stockVal) || 0);
    setForm({ ...form, initialVariants: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEditing) {
        await api.adminUpdateProduct(id, form);
        alert('Product specifications updated successfully');
      } else {
        await api.adminCreateProduct(form);
        alert('New product SKU registered in catalog successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      alert(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="#2563eb" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/admin/products')}
          className="admin-btn admin-btn-ghost"
          style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '6px' }}
        >
          <ArrowLeft size={14} /> Back to Products Catalog
        </button>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
          {isEditing ? `Edit Product: ${form.name}` : 'Create New Footwear SKU'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
          Configure master specifications, pricing, individual colorways, and sellable UK size matrices.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card 1: Master Specifications */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-title">1. Product Identification & Classification</span>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Master SKU metadata</span>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Apex Cloud Hydro Clog"
                />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Master SKU Prefix *</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  className="admin-input"
                  placeholder="CALZ-CLG-APEX"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="admin-select"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Silhouette Type</label>
                <select
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  className="admin-select"
                >
                  <option value="Clogs">Clogs</option>
                  <option value="Sliders">Sliders</option>
                  <option value="Sandals">Sandals</option>
                  <option value="Foam Walkers">Foam Walkers</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Audience</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="admin-select"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Catalog Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="admin-select"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Base Regular Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={form.baseRegularPrice}
                  onChange={(e) => setForm({ ...form, baseRegularPrice: Number(e.target.value) })}
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-label">Base Sale Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={form.baseSalePrice}
                  onChange={(e) => setForm({ ...form, baseSalePrice: Number(e.target.value) })}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Short Summary (Storefront Cards & Quick View) *</label>
              <input
                type="text"
                required
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="admin-input"
                placeholder="e.g. Dual-density closed-cell waterproof EVA foam with arch ventilation."
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Detailed Product Narrative & Specifications</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-textarea"
                placeholder="Full editorial and technical product description..."
              />
            </div>
          </div>
        </div>

        {/* Card 2: Variants & Size Matrix */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-title">2. Colorways & UK Size Inventory Matrix</span>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Each colorway supports independent photography, pricing, and UK size stock units.
              </div>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              style={{ fontSize: '0.78rem' }}
              onClick={handleAddVariant}
            >
              <Plus size={14} /> Add Colorway
            </button>
          </div>

          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {form.initialVariants?.map((v, vIdx) => (
              <div
                key={vIdx}
                style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                }}
              >
                {/* Variant Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: v.colorHex,
                        border: '1px solid #cbd5e1',
                      }}
                    />
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                      Colorway #{vIdx + 1}: {v.colorName}
                    </strong>
                  </div>
                  {form.initialVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(vIdx)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label className="admin-label">Color Name</label>
                    <input
                      type="text"
                      value={v.colorName}
                      onChange={(e) => handleVariantChange(vIdx, 'colorName', e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Hex Swatch</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="color"
                        value={v.colorHex}
                        onChange={(e) => handleVariantChange(vIdx, 'colorHex', e.target.value)}
                        style={{ width: '36px', height: '34px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #cbd5e1' }}
                      />
                      <input
                        type="text"
                        value={v.colorHex}
                        onChange={(e) => handleVariantChange(vIdx, 'colorHex', e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Sale Price (₹)</label>
                    <input
                      type="number"
                      value={v.salePrice}
                      onChange={(e) => handleVariantChange(vIdx, 'salePrice', Number(e.target.value))}
                      className="admin-input"
                    />
                  </div>
                  <div>
                    <label className="admin-label">Primary Image URL</label>
                    <input
                      type="text"
                      value={v.images?.[0]?.url || ''}
                      onChange={(e) =>
                        handleVariantChange(vIdx, 'images', [{ url: e.target.value, isMain: true }])
                      }
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* UK Size Stock Grid */}
                <div style={{ background: '#ffffff', borderRadius: '6px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.76rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Available Units by Footwear Size (UK)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {v.sizes?.map((sz, sIdx) => (
                      <div key={sz.size} style={{ textAlign: 'center', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{sz.size}</div>
                        <input
                          type="number"
                          min="0"
                          value={sz.stock}
                          onChange={(e) => handleSizeStockChange(vIdx, sIdx, e.target.value)}
                          className="admin-input"
                          style={{ textAlign: 'center', padding: '4px 6px', fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}
                        />
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>in stock</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ padding: '9px 20px', fontSize: '0.84rem' }}
            disabled={saving}
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Product Specifications'}
          </button>
        </div>
      </form>
    </div>
  );
};
