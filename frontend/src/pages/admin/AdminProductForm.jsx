import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api.js';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Layers,
  Tag,
  Sparkles,
  Ruler,
  HelpCircle,
  FileText,
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  Box,
  Palette,
  ShieldCheck,
  Truck,
  MoveUp,
  MoveDown,
  Globe,
  Info,
} from 'lucide-react';
import { ImageUploadField, MultiImageUploadField } from '../../components/admin/ImageUploadField.jsx';

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Tab State
  const [activeTab, setActiveTab] = useState('basic');

  // Metadata dependencies
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Master Product Form State supporting Groups 1 through 10
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    brand: 'CALZARE',
    tagline: '',
    category: '',
    subcategory: '',
    collections: [],
    productType: 'Clogs',
    audience: 'Unisex',
    baseRegularPrice: 1499,
    baseSalePrice: 899,
    taxRatePercentage: 18,
    shortDescription: '',
    description: '',
    status: 'published',
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    tags: ['waterproof', 'eva-foam', 'clogs'],
    defaultImages: [
      {
        url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
        alt: 'Product profile view',
        isMain: true,
      },
    ],
    videoUrl: '',

    // Group 2: Main product-page copy overrides
    customCopy: {
      eyebrow: '',
      titleOverride: '',
      subtitle: '',
      sellingStatement: '',
      priceLabel: '',
      offerHeading: 'SPECIAL DROP DISCOUNT',
      offerDescription: 'Apply code CALZARE100 at checkout for instant ₹100 savings on first order.',
      addToCartText: '',
      buyNowText: '',
      outOfStockMessage: '',
      lowStockThreshold: 5,
      lowStockMessage: '',
      colorHeading: '',
      sizeHeading: '',
      sizeGuideButtonText: '',
      deliveryCheckHeading: '',
      deliveryCheckPlaceholder: '',
      deliveryCheckButtonText: '',
      shippingHeading: '',
      dispatchInfo: 'Orders processed within 1–2 business days. Estimated delivery 3–7 business days across India.',
      deliveryGuidance: 'Tracking link sent via SMS/Email upon dispatch. Real-time updates supported.',
      codMessage: 'Cash on Delivery (COD) & Partial COD available for eligible PIN codes across India.',
      returnHeading: '',
      returnPolicy: 'Size exchange requests must be submitted within 3 days of delivery (disclosed exchange fee of ₹149 applies to help cover shipping & logistics). Damaged or defective items must be reported within 48 hours of delivery (unboxing video recommended).',
      faqHeading: '',
      relatedProductsHeading: '',
      relatedProductsSubtitle: '',
    },

    // Group 3: Product Storytelling repeatable content blocks
    storytellingBlocks: [
      {
        heading: 'ENGINEERED FOR THE CONCRETE WILD',
        subheading: 'Closed-Cell Microfoam Technology',
        body: 'Every contour of the silhouette is pressure-mapped against human biomechanics to absorb shock and distribute bodyweight evenly across your stride.',
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'Foam cushioning macro view',
        videoUrl: '',
        layout: 'image_right',
        isEnabled: true,
        displayOrder: 0,
      },
    ],

    // Group 4: Key features with icon, description, and visibility
    richFeatures: [
      {
        icon: 'Droplet',
        heading: '100% Waterproof & Hydrophobic',
        description: 'Closed-cell EVA matrix resists water, mud, and dirt. Quick-rinse and fast-dry in under 10 minutes.',
        imageUrl: '',
        isVisible: true,
        order: 0,
      },
      {
        icon: 'Feather',
        heading: 'Featherlight Ergonomics',
        description: 'Weighs under 290g per shoe, preventing ankle strain and fatigue during 15,000-step walking days.',
        imageUrl: '',
        isVisible: true,
        order: 1,
      },
      {
        icon: 'Shield',
        heading: 'Deep Lug Anti-Slip Outsole',
        description: 'Deep diamond channels provide immediate traction on slick wet surfaces and uneven pavements.',
        imageUrl: '',
        isVisible: true,
        order: 2,
      },
      {
        icon: 'Sparkles',
        heading: 'Antimicrobial Odor Barrier',
        description: 'Zero bacterial absorption prevents unwanted odor even during humid monsoons and intense daily wear.',
        imageUrl: '',
        isVisible: true,
        order: 3,
      },
    ],

    // Group 5: Materials, Fit, Care & Detailed Specifications
    materialsAndCare: {
      material: 'Premium High-Density Closed-Cell EVA Foam Compound',
      construction: 'Monolithic Injection-Molded Ergonomic Shell with Swivel Heel Pivot',
      fitDescription: 'Relaxed Street Fit. Roomy toe box for natural splay. Order your usual UK size.',
      comfortDetails: 'Anatomical contoured arch support with textured massaging footbed nodes.',
      careInstructions: 'Hand wash with mild soap and cool water. Air dry in a shaded area. Do not expose to intense direct heat.',
      warranty: '6 Months Manufacturer Guarantee against sole separation and material defects.',
      isVisible: true,
    },

    specifications: [
      { name: 'Upper Material', value: 'Waterproof Closed-Cell EVA Foam', isVisible: true },
      { name: 'Sole Construction', value: 'Dual-Density Anti-Skid Rubberized Lug Sole', isVisible: true },
      { name: 'Closure System', value: 'Convertible Heel Pivot Swivel Strap', isVisible: true },
      { name: 'Weight', value: '280g (Single Shoe UK 7)', isVisible: true },
      { name: 'Country of Origin', value: 'Designed in Bengaluru, India', isVisible: true },
    ],

    // Group 6: Size guide configuration
    sizeGuideConfig: {
      title: 'Footwear Size & Measurement Guide',
      instructions:
        'Place your bare foot on a blank sheet of paper with heel against the wall. Mark the tip of your longest toe and measure the distance in centimeters.',
      measurementUnit: 'cm',
      chartImageUrl: '',
      isVisible: true,
    },

    sizeChart: {
      title: 'Standard Footwear Size Guide (UK/India)',
      measurements: [
        { uk: 'UK 6', eu: 'EU 40', us: 'US 7', footLengthCm: 25.0 },
        { uk: 'UK 7', eu: 'EU 41', us: 'US 8', footLengthCm: 25.8 },
        { uk: 'UK 8', eu: 'EU 42', us: 'US 9', footLengthCm: 26.6 },
        { uk: 'UK 9', eu: 'EU 43', us: 'US 10', footLengthCm: 27.4 },
        { uk: 'UK 10', eu: 'EU 44', us: 'US 11', footLengthCm: 28.2 },
        { uk: 'UK 11', eu: 'EU 45', us: 'US 12', footLengthCm: 29.0 },
      ],
    },

    // Group 7: Colours and variants
    initialVariants: [
      {
        colorName: 'Oat Beige',
        colorHex: '#D9CFBE',
        variantSku: 'CALZ-OAT',
        regularPrice: 1499,
        salePrice: 899,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
            alt: 'Oat Beige Side Angle',
            isMain: true,
          },
        ],
        sizes: [
          { size: 'UK 6', stock: 15, sku: 'CALZ-OAT-06' },
          { size: 'UK 7', stock: 20, sku: 'CALZ-OAT-07' },
          { size: 'UK 8', stock: 20, sku: 'CALZ-OAT-08' },
          { size: 'UK 9', stock: 15, sku: 'CALZ-OAT-09' },
          { size: 'UK 10', stock: 10, sku: 'CALZ-OAT-10' },
        ],
      },
    ],

    // Group 8: Shipping, returns, and product FAQs
    faqs: [
      {
        question: 'Are these true to size?',
        answer:
          'Yes! CALZARE silhouettes are designed with a relaxed street fit. If you usually wear UK 8, choose UK 8. If you have wide feet, our generous toe box accommodates comfortably.',
      },
      {
        question: 'How do I clean my CALZARE foam shoes?',
        answer:
          'Simply rinse under cool tap water with a soft cloth and mild soap. Air dry in the shade. Avoid leaving them in direct hot sunlight or hot cars.',
      },
      {
        question: 'Can I wear these in the rain and water?',
        answer:
          'Absolutely. The closed-cell EVA foam is completely hydrophobic and waterproof. Water beads right off without absorbing moisture or odor.',
      },
      {
        question: 'What is the return and exchange policy?',
        answer:
          'We offer an easy 7-day doorstep return or size exchange from the date of delivery. Footwear must be in unworn condition with tags attached.',
      },
    ],

    // Group 9: Related products
    relatedProducts: [],

    // Group 10: SEO & Social Sharing
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ['clogs', 'waterproof shoes', 'eva foam', 'streetwear footwear', 'comfortable slides'],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
  });

  // Load Catalog Dependencies & Product Data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        const [catRes, collRes, prodsRes] = await Promise.all([
          api.getCategories(),
          api.getCollections(),
          api.getProducts({ limit: 100 }),
        ]);

        if (catRes.success) setCategories(catRes.categories || []);
        if (collRes.success) setCollections(collRes.collections || []);
        if (prodsRes.success) {
          setAllProducts(
            (prodsRes.products || []).filter((p) => (isEditing ? p._id !== id : true))
          );
        }

        if (isEditing) {
          const res = await api.adminGetProductById(id);
          if (res.success && res.product) {
            const p = res.product;
            setForm((prev) => ({
              ...prev,
              ...p,
              category: p.category?._id || p.category,
              collections: (p.collections || []).map((c) => c._id || c),
              initialVariants: p.variants?.length ? p.variants : prev.initialVariants,
              customCopy: { ...prev.customCopy, ...(p.customCopy || {}) },
              materialsAndCare: { ...prev.materialsAndCare, ...(p.materialsAndCare || {}) },
              sizeGuideConfig: { ...prev.sizeGuideConfig, ...(p.sizeGuideConfig || {}) },
              sizeChart: p.sizeChart || prev.sizeChart,
              specifications: p.specifications?.length ? p.specifications : prev.specifications,
              richFeatures: p.richFeatures?.length ? p.richFeatures : prev.richFeatures,
              storytellingBlocks: p.storytellingBlocks?.length ? p.storytellingBlocks : prev.storytellingBlocks,
              faqs: p.faqs?.length ? p.faqs : prev.faqs,
              relatedProducts: (p.relatedProducts || []).map((r) => r._id || r),
              tags: p.tags?.length ? p.tags : prev.tags,
            }));
          }
        } else if (catRes.categories?.length) {
          setForm((prev) => ({ ...prev, category: catRes.categories[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load initial form data:', err);
        setError(err.message || 'Error fetching product information');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing]);

  // Variant Helpers
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
    updated[varIdx].sizes[sizeIdx].stock = Math.max(0, parseInt(stockVal, 10) || 0);
    setForm({ ...form, initialVariants: updated });
  };

  // Storytelling Block Helpers
  const handleAddStoryBlock = () => {
    setForm({
      ...form,
      storytellingBlocks: [
        ...form.storytellingBlocks,
        {
          heading: 'NEW STORY CHAPTER',
          subheading: 'Craftsmanship Insight',
          body: 'Detailed narrative description of the materials, testing, or creative inspiration behind this design.',
          imageUrl: '',
          imageAlt: '',
          videoUrl: '',
          layout: 'image_right',
          isEnabled: true,
          displayOrder: form.storytellingBlocks.length,
        },
      ],
    });
  };

  const handleRemoveStoryBlock = (idx) => {
    setForm({
      ...form,
      storytellingBlocks: form.storytellingBlocks.filter((_, i) => i !== idx),
    });
  };

  const handleStoryBlockChange = (idx, field, val) => {
    const updated = [...form.storytellingBlocks];
    updated[idx][field] = val;
    setForm({ ...form, storytellingBlocks: updated });
  };

  // Feature Helpers
  const handleAddFeature = () => {
    setForm({
      ...form,
      richFeatures: [
        ...form.richFeatures,
        {
          icon: 'Sparkles',
          heading: 'New Key Feature',
          description: 'Highlight what makes this footwear exceptional.',
          imageUrl: '',
          isVisible: true,
          order: form.richFeatures.length,
        },
      ],
    });
  };

  const handleRemoveFeature = (idx) => {
    setForm({
      ...form,
      richFeatures: form.richFeatures.filter((_, i) => i !== idx),
    });
  };

  const handleFeatureChange = (idx, field, val) => {
    const updated = [...form.richFeatures];
    updated[idx][field] = val;
    setForm({ ...form, richFeatures: updated });
  };

  // Specification Helpers
  const handleAddSpec = () => {
    setForm({
      ...form,
      specifications: [...form.specifications, { name: 'Attribute', value: 'Details', isVisible: true }],
    });
  };

  const handleRemoveSpec = (idx) => {
    setForm({
      ...form,
      specifications: form.specifications.filter((_, i) => i !== idx),
    });
  };

  const handleSpecChange = (idx, field, val) => {
    const updated = [...form.specifications];
    updated[idx][field] = val;
    setForm({ ...form, specifications: updated });
  };

  // FAQ Helpers
  const handleAddFaq = () => {
    setForm({
      ...form,
      faqs: [...form.faqs, { question: 'Frequently asked customer question?', answer: 'Clear and helpful answer.' }],
    });
  };

  const handleRemoveFaq = (idx) => {
    setForm({
      ...form,
      faqs: form.faqs.filter((_, i) => i !== idx),
    });
  };

  const handleFaqChange = (idx, field, val) => {
    const updated = [...form.faqs];
    updated[idx][field] = val;
    setForm({ ...form, faqs: updated });
  };

  // Size Chart Row Helpers
  const handleAddSizeRow = () => {
    const chart = form.sizeChart || { measurements: [] };
    const current = chart.measurements || [];
    const nextUk = `UK ${current.length + 6}`;
    setForm({
      ...form,
      sizeChart: {
        ...chart,
        measurements: [
          ...current,
          { uk: nextUk, eu: `EU ${current.length + 40}`, us: `US ${current.length + 7}`, footLengthCm: 25.0 + current.length * 0.8 },
        ],
      },
    });
  };

  const handleRemoveSizeRow = (idx) => {
    const chart = form.sizeChart || { measurements: [] };
    setForm({
      ...form,
      sizeChart: {
        ...chart,
        measurements: (chart.measurements || []).filter((_, i) => i !== idx),
      },
    });
  };

  const handleSizeRowChange = (idx, field, val) => {
    const chart = form.sizeChart || { measurements: [] };
    const updated = [...(chart.measurements || [])];
    updated[idx][field] = field === 'footLengthCm' ? parseFloat(val) || 0 : val;
    setForm({
      ...form,
      sizeChart: {
        ...chart,
        measurements: updated,
      },
    });
  };

  // Submit Handler
  const handleSubmit = async (e, saveStatus) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSaveSuccess(false);

      const payload = { ...form };
      if (saveStatus) payload.status = saveStatus;

      // Automatically format uppercase SKU
      if (payload.sku) payload.sku = payload.sku.toUpperCase();

      if (isEditing) {
        await api.adminUpdateProduct(id, payload);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const res = await api.adminCreateProduct(payload);
        if (res.success && res.product?._id) {
          navigate(`/admin/products/edit/${res.product._id}`);
        } else {
          navigate('/admin/products');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save product specifications');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
        <Loader2 size={36} className="animate-spin" color="#0f172a" />
        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#64748b' }}>
          Loading product specifications...
        </span>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: '1. Basic Info', icon: Box },
    { id: 'copy', label: '2. Page Copy', icon: FileText },
    { id: 'story', label: '3. Storytelling', icon: Sparkles },
    { id: 'features', label: '4. Key Features', icon: Sparkles },
    { id: 'materials', label: '5. Materials & Care', icon: ShieldCheck },
    { id: 'sizeGuide', label: '6. Size Guide', icon: Ruler },
    { id: 'variants', label: '7. Colours & Sizes', icon: Palette },
    { id: 'shippingFaq', label: '8. Shipping & FAQs', icon: Truck },
    { id: 'related', label: '9. Related Items', icon: Layers },
    { id: 'seo', label: '10. SEO & Social', icon: Globe },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Top Header & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="action-icon-btn"
            style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1px solid #cbd5e1' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {isEditing ? `Edit: ${form.name || 'Product Silhouette'}` : 'Register New Footwear Silhouette'}
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              {isEditing ? `SKU: ${form.sku || 'N/A'} • Status: ${form.status}` : 'Create complete product catalog entry'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isEditing && (
            <Link
              to={`/product/${form.slug || form._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={15} /> Preview Storefront
            </Link>
          )}

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving}
            className="admin-btn admin-btn-outline"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saving}
            className="admin-btn admin-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEditing ? 'Publish Updates' : 'Publish Product'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '6px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <CheckCircle size={18} /> Product configuration updated and published to storefront!
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '6px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '24px',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 15px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#0f172a' : '#64748b',
                background: isActive ? '#ffffff' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2.5px solid #0f172a' : '2.5px solid transparent',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} color={isActive ? '#0f172a' : '#94a3b8'} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels Form */}
      <form onSubmit={(e) => handleSubmit(e, form.status)}>
        {/* ==============================================================
            GROUP 1: BASIC PRODUCT INFORMATION
            ============================================================== */}
        {activeTab === 'basic' && (
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>
              Group 1: Basic Catalog & Pricing Information
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Canonical identity, category taxonomic mapping, and pricing structure.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Apex Hydro Clog"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Stock Keeping Unit (SKU) *</label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  className="admin-input"
                  placeholder="e.g. CLZ-APX-01"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Brand / Line</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Custom URL Slug (Safe auto-generation with manual override)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input"
                  placeholder="leave blank to auto-generate from product name"
                />
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Canonical storefront path: <code>/product/{form.slug || 'auto-generated-slug'}</code>
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Publication Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="admin-select"
                >
                  <option value="published">Published (Visible on Storefront)</option>
                  <option value="draft">Draft (Admin Only)</option>
                  <option value="archived">Archived (Unlisted)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Footwear Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="admin-select"
                >
                  <option value="">Select Primary Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Product Type</label>
                <select
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  className="admin-select"
                >
                  <option value="Clogs">Clogs</option>
                  <option value="Sliders">Sliders</option>
                  <option value="Sandals">Sandals</option>
                  <option value="Sneakers">Sneakers</option>
                  <option value="Foam Walkers">Foam Walkers</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Target Audience</label>
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
            </div>

            {/* Pricing Area */}
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
                Pricing (INR ₹)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.baseSalePrice}
                    onChange={(e) => setForm({ ...form, baseSalePrice: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Comparison / MRP Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.baseRegularPrice}
                    onChange={(e) => setForm({ ...form, baseRegularPrice: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Calculated Discount</label>
                  <div style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#059669', fontSize: '0.92rem' }}>
                    {form.baseRegularPrice > form.baseSalePrice
                      ? `${Math.round(((form.baseRegularPrice - form.baseSalePrice) / form.baseRegularPrice) * 100)}% SAVINGS`
                      : 'No Discount'}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Short Product Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="admin-input"
                placeholder="e.g. Sculptural Closed-Cell Cloud Footwear"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Listing Summary (1-2 sentences)</label>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="admin-textarea"
                placeholder="Brief summary displayed on product cards and search results."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Full Product Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-textarea"
                placeholder="Comprehensive editorial narrative outlining the footwear design and technical construction."
              />
            </div>

            {/* Badges Toggle */}
            <div style={{ display: 'flex', gap: '24px', paddingTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={form.isBestseller}
                  onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })}
                />
                Bestseller Badge
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                />
                New Arrival Badge
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Featured on Home
              </label>
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 2: MAIN PRODUCT-PAGE COPY & MICROCOPY
            ============================================================== */}
        {activeTab === 'copy' && (
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>
              Group 2: Product Page Copy & Action Microcopy
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Independently manage all labels, button text, promotional banners, and stock alerts. Leave blank to inherit store-wide defaults.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Title Override (Optional)</label>
                <input
                  type="text"
                  value={form.customCopy?.titleOverride || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, titleOverride: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Defaults to canonical product name"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Subtitle / Hook Statement</label>
                <input
                  type="text"
                  value={form.customCopy?.subtitle || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, subtitle: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="e.g. Sculptural EVA Clogs with Anatomical Arch Lift"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Short Selling Statement</label>
                <input
                  type="text"
                  value={form.customCopy?.sellingStatement || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, sellingStatement: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="e.g. Engineered for 20,000 steps of daily pavement walking."
                />
              </div>
            </div>

            {/* Promotional Offer Banner */}
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>
                Product-Specific Offer Banner
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Offer Heading</label>
                  <input
                    type="text"
                    value={form.customCopy?.offerHeading || ''}
                    onChange={(e) =>
                      setForm({ ...form, customCopy: { ...form.customCopy, offerHeading: e.target.value } })
                    }
                    className="admin-input"
                    placeholder="e.g. FLAT ₹100 OFF"
                  />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-label">Offer Description & Promo Code</label>
                  <input
                    type="text"
                    value={form.customCopy?.offerDescription || ''}
                    onChange={(e) =>
                      setForm({ ...form, customCopy: { ...form.customCopy, offerDescription: e.target.value } })
                    }
                    className="admin-input"
                    placeholder="e.g. Use code FIRST100 at checkout on prepaid orders."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons & Stock Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Add to Bag Button Text</label>
                <input
                  type="text"
                  value={form.customCopy?.addToCartText || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, addToCartText: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: ADD TO BAG"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Buy Now Button Text</label>
                <input
                  type="text"
                  value={form.customCopy?.buyNowText || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, buyNowText: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: BUY IT NOW"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Out of Stock Message</label>
                <input
                  type="text"
                  value={form.customCopy?.outOfStockMessage || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, outOfStockMessage: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: SOLD OUT"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  value={form.customCopy?.lowStockThreshold ?? 5}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      customCopy: { ...form.customCopy, lowStockThreshold: Number(e.target.value) },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Low Stock Scarcity Notice</label>
                <input
                  type="text"
                  value={form.customCopy?.lowStockMessage || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, lowStockMessage: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="e.g. Hurry! High demand in this size."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Color Selector Heading</label>
                <input
                  type="text"
                  value={form.customCopy?.colorHeading || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, colorHeading: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: Select Colorway"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Size Selector Heading</label>
                <input
                  type="text"
                  value={form.customCopy?.sizeHeading || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, sizeHeading: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: Select Size (UK/India)"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Size Guide Button Text</label>
                <input
                  type="text"
                  value={form.customCopy?.sizeGuideButtonText || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, sizeGuideButtonText: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: Size & Fit Guide"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 3: PRODUCT STORYTELLING BLOCKS
            ============================================================== */}
        {activeTab === 'story' && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Group 3: Product Storytelling Blocks
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                  Create rich editorial narrative sections that showcase your footwear inspiration, foam testing, and craftsmanship.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStoryBlock}
                className="admin-btn admin-btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Story Block
              </button>
            </div>

            {form.storytellingBlocks.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                No storytelling blocks added. Click "Add Story Block" to add rich editorial narratives.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {form.storytellingBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '18px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                        Story Block #{idx + 1}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={block.isEnabled}
                            onChange={(e) => handleStoryBlockChange(idx, 'isEnabled', e.target.checked)}
                          />
                          Visible on page
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveStoryBlock(idx)}
                          className="action-icon-btn"
                          style={{ color: '#ef4444', width: '28px', height: '28px' }}
                          title="Delete Block"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '12px' }}>
                      <div>
                        <label className="admin-label">Headline / Chapter Title</label>
                        <input
                          type="text"
                          value={block.heading || ''}
                          onChange={(e) => handleStoryBlockChange(idx, 'heading', e.target.value)}
                          className="admin-input"
                          placeholder="e.g. ENGINEERED FOR CONCRETE WILD"
                        />
                      </div>
                      <div>
                        <label className="admin-label">Layout Arrangement</label>
                        <select
                          value={block.layout || 'image_right'}
                          onChange={(e) => handleStoryBlockChange(idx, 'layout', e.target.value)}
                          className="admin-select"
                        >
                          <option value="image_right">Image on Right</option>
                          <option value="image_left">Image on Left</option>
                          <option value="full_width_media">Full-Width Media</option>
                          <option value="text_only">Text Only Editorial</option>
                        </select>
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Subheading</label>
                      <input
                        type="text"
                        value={block.subheading || ''}
                        onChange={(e) => handleStoryBlockChange(idx, 'subheading', e.target.value)}
                        className="admin-input"
                        placeholder="e.g. Closed-cell compound resilience"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Narrative Story Copy</label>
                      <textarea
                        rows={3}
                        value={block.body || ''}
                        onChange={(e) => handleStoryBlockChange(idx, 'body', e.target.value)}
                        className="admin-textarea"
                        placeholder="Tell the story of how this shoe was engineered, road-tested, and perfected."
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <ImageUploadField
                        label="Story Editorial Photograph"
                        description="Upload rich lifestyle or material testing photography"
                        value={block.imageUrl || ''}
                        onChange={(url) => handleStoryBlockChange(idx, 'imageUrl', url)}
                        aspectRatio="banner"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            GROUP 4: KEY FEATURES
            ============================================================== */}
        {activeTab === 'features' && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Group 4: Key Footwear Highlights & Features
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                  Configure highlight badges, icon cards, and technical performance points.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFeature}
                className="admin-btn admin-btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Feature Card
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {form.richFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <select
                        value={feat.icon || 'Sparkles'}
                        onChange={(e) => handleFeatureChange(idx, 'icon', e.target.value)}
                        className="admin-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.76rem' }}
                      >
                        <option value="Sparkles">Sparkles Icon</option>
                        <option value="Droplet">Droplet (Waterproof)</option>
                        <option value="Feather">Feather (Lightweight)</option>
                        <option value="Shield">Shield (Durable)</option>
                        <option value="Wind">Wind (Breathable)</option>
                        <option value="Zap">Zap (Energy Return)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="action-icon-btn"
                        style={{ color: '#ef4444', width: '26px', height: '26px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Feature Title</label>
                      <input
                        type="text"
                        value={feat.heading || ''}
                        onChange={(e) => handleFeatureChange(idx, 'heading', e.target.value)}
                        className="admin-input"
                        placeholder="e.g. 100% Waterproof"
                      />
                    </div>

                    <div className="admin-form-group" style={{ marginBottom: '8px' }}>
                      <label className="admin-label">Description</label>
                      <textarea
                        rows={2}
                        value={feat.description || ''}
                        onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)}
                        className="admin-textarea"
                        placeholder="Explain this technical benefit..."
                      />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', cursor: 'pointer', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      checked={feat.isVisible !== false}
                      onChange={(e) => handleFeatureChange(idx, 'isVisible', e.target.checked)}
                    />
                    Display on product page
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 5: MATERIALS, FIT, CARE & SPECIFICATIONS
            ============================================================== */}
        {activeTab === 'materials' && (
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>
              Group 5: Materials, Fit Advice, Care & Specifications
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Detailed construction disclosures, sizing advice, washing instructions, and technical specs table.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Upper & Footbed Material</label>
                <input
                  type="text"
                  value={form.materialsAndCare?.material || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      materialsAndCare: { ...form.materialsAndCare, material: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Molding Construction Method</label>
                <input
                  type="text"
                  value={form.materialsAndCare?.construction || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      materialsAndCare: { ...form.materialsAndCare, construction: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Fit & Sizing Recommendation</label>
                <textarea
                  rows={2}
                  value={form.materialsAndCare?.fitDescription || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      materialsAndCare: { ...form.materialsAndCare, fitDescription: e.target.value },
                    })
                  }
                  className="admin-textarea"
                  placeholder="e.g. True to size. Roomy toe box for natural splay."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Washing & Care Instructions</label>
                <textarea
                  rows={2}
                  value={form.materialsAndCare?.careInstructions || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      materialsAndCare: { ...form.materialsAndCare, careInstructions: e.target.value },
                    })
                  }
                  className="admin-textarea"
                  placeholder="e.g. Rinse with cold water. Air dry in shade."
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Warranty & Durability Guarantee</label>
              <input
                type="text"
                value={form.materialsAndCare?.warranty || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    materialsAndCare: { ...form.materialsAndCare, warranty: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="e.g. 6 Months Manufacturer Guarantee"
              />
            </div>

            {/* Specifications Table */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  Technical Specifications Table
                </span>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="admin-btn admin-btn-outline"
                  style={{ fontSize: '0.74rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Add Specification Row
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.specifications.map((spec, sIdx) => (
                  <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={spec.name || ''}
                      onChange={(e) => handleSpecChange(sIdx, 'name', e.target.value)}
                      className="admin-input"
                      placeholder="Spec Name (e.g. Closure)"
                    />
                    <input
                      type="text"
                      value={spec.value || ''}
                      onChange={(e) => handleSpecChange(sIdx, 'value', e.target.value)}
                      className="admin-input"
                      placeholder="Spec Value (e.g. Swivel Strap)"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(sIdx)}
                      className="action-icon-btn"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 6: SIZE GUIDE
            ============================================================== */}
        {activeTab === 'sizeGuide' && (
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>
              Group 6: Size Chart & Measurement Guide
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Fully configurable size table and measurement guidance shown when customers click "Size & Fit Guide".
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Size Chart Dialog Title</label>
                <input
                  type="text"
                  value={form.sizeGuideConfig?.title || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sizeGuideConfig: { ...form.sizeGuideConfig, title: e.target.value },
                    })
                  }
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Measurement Unit</label>
                <select
                  value={form.sizeGuideConfig?.measurementUnit || 'cm'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sizeGuideConfig: { ...form.sizeGuideConfig, measurementUnit: e.target.value },
                    })
                  }
                  className="admin-select"
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="inches">Inches (in)</option>
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Measurement Instructions</label>
              <textarea
                rows={2}
                value={form.sizeGuideConfig?.instructions || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sizeGuideConfig: { ...form.sizeGuideConfig, instructions: e.target.value },
                  })
                }
                className="admin-textarea"
              />
            </div>

            {/* Size Table Matrix */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  Editable Size Chart Matrix
                </span>
                <button
                  type="button"
                  onClick={handleAddSizeRow}
                  className="admin-btn admin-btn-outline"
                  style={{ fontSize: '0.74rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Add Size Row
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>UK / India Size</th>
                      <th>EU Size</th>
                      <th>US Size</th>
                      <th>Foot Length (cm)</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(form.sizeChart?.measurements || []).map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td>
                          <input
                            type="text"
                            value={row.uk || ''}
                            onChange={(e) => handleSizeRowChange(rIdx, 'uk', e.target.value)}
                            className="admin-input"
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.eu || ''}
                            onChange={(e) => handleSizeRowChange(rIdx, 'eu', e.target.value)}
                            className="admin-input"
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.us || ''}
                            onChange={(e) => handleSizeRowChange(rIdx, 'us', e.target.value)}
                            className="admin-input"
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            value={row.footLengthCm || ''}
                            onChange={(e) => handleSizeRowChange(rIdx, 'footLengthCm', e.target.value)}
                            className="admin-input"
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleRemoveSizeRow(rIdx)}
                            className="action-icon-btn"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 7: COLOURS AND VARIANTS
            ============================================================== */}
        {activeTab === 'variants' && (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Group 7: Colourways & Inventory Matrix
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0' }}>
                  Each colorway maintains its own product photo gallery, hex swatch, and size inventory stock.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="admin-btn admin-btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Color Variant
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {form.initialVariants.map((variant, vIdx) => (
                <div
                  key={vIdx}
                  style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: variant.colorHex,
                          display: 'inline-block',
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}
                      />
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        {variant.colorName || `Colorway #${vIdx + 1}`}
                      </span>
                    </div>

                    {form.initialVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(vIdx)}
                        className="action-icon-btn"
                        style={{ color: '#ef4444' }}
                        title="Remove Variant"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label className="admin-label">Color Name</label>
                      <input
                        type="text"
                        value={variant.colorName}
                        onChange={(e) => handleVariantChange(vIdx, 'colorName', e.target.value)}
                        className="admin-input"
                        placeholder="e.g. Oat Beige"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Hex Swatch</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={variant.colorHex}
                          onChange={(e) => handleVariantChange(vIdx, 'colorHex', e.target.value)}
                          style={{ width: '38px', height: '38px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={variant.colorHex}
                          onChange={(e) => handleVariantChange(vIdx, 'colorHex', e.target.value)}
                          className="admin-input"
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="admin-label">Sale Price (₹)</label>
                      <input
                        type="number"
                        value={variant.salePrice}
                        onChange={(e) => handleVariantChange(vIdx, 'salePrice', Number(e.target.value))}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Regular Price (₹)</label>
                      <input
                        type="number"
                        value={variant.regularPrice}
                        onChange={(e) => handleVariantChange(vIdx, 'regularPrice', Number(e.target.value))}
                        className="admin-input"
                      />
                    </div>
                  </div>

                  {/* Variant Specific Images */}
                  <div className="admin-form-group">
                    <MultiImageUploadField
                      label={`Gallery Images for ${variant.colorName}`}
                      description="Upload multiple product angles (Primary, Lateral, Top-down, Heel profile, Macro sole lug)"
                      images={variant.images || []}
                      onChange={(newImgs) => handleVariantChange(vIdx, 'images', newImgs)}
                    />
                  </div>

                  {/* Size Inventory Matrix */}
                  <div style={{ background: '#ffffff', borderRadius: '8px', padding: '14px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
                      Size Inventory Matrix & Stock Allocation
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                      {variant.sizes?.map((sz, sIdx) => (
                        <div key={sIdx} style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                            {sz.size}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={sz.stock}
                            onChange={(e) => handleSizeStockChange(vIdx, sIdx, e.target.value)}
                            className="admin-input"
                            style={{ textAlign: 'center', padding: '4px', fontSize: '0.84rem' }}
                          />
                          <span style={{ fontSize: '0.68rem', color: sz.stock > 0 ? '#059669' : '#ef4444', fontWeight: 700, marginTop: '2px', display: 'block' }}>
                            {sz.stock > 0 ? `${sz.stock} in stock` : 'Sold out'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 8: SHIPPING, RETURNS & FAQS
            ============================================================== */}
        {activeTab === 'shippingFaq' && (
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>
              Group 8: Shipping, Return Information & Product FAQs
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Configure product-specific delivery notices, return policy statements, and expandable question-and-answer pairs.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Shipping Accordion Heading</label>
                <input
                  type="text"
                  value={form.customCopy?.shippingHeading || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, shippingHeading: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: Shipping & Delivery"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Dispatch Notice</label>
                <input
                  type="text"
                  value={form.customCopy?.dispatchInfo || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, dispatchInfo: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="e.g. Orders processed within 1–2 business days. Estimated delivery 3–7 business days."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Return Accordion Heading</label>
                <input
                  type="text"
                  value={form.customCopy?.returnHeading || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, returnHeading: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: Refund, Return & Exchange Policy"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Return & Exchange Details</label>
                <input
                  type="text"
                  value={form.customCopy?.returnPolicy || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, returnPolicy: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="e.g. 3-day size exchange window (₹149 fee). Damaged items reported within 48 hours."
                />
              </div>
            </div>

            {/* Repeatable FAQs */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  Frequently Asked Questions (Accordion Pairs)
                </span>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="admin-btn admin-btn-outline"
                  style={{ fontSize: '0.74rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Add FAQ Question
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {form.faqs.map((faq, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      padding: '14px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="admin-label" style={{ marginBottom: 0 }}>
                        Question #{fIdx + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(fIdx)}
                        className="action-icon-btn"
                        style={{ color: '#ef4444', width: '26px', height: '26px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => handleFaqChange(fIdx, 'question', e.target.value)}
                      className="admin-input"
                      placeholder="e.g. Can these be worn in water?"
                    />

                    <textarea
                      rows={2}
                      value={faq.answer || ''}
                      onChange={(e) => handleFaqChange(fIdx, 'answer', e.target.value)}
                      className="admin-textarea"
                      placeholder="Comprehensive answer for the customer..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 9: RELATED PRODUCTS
            ============================================================== */}
        {activeTab === 'related' && (
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>
              Group 9: Curated Related Products & Cross-Sells
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Select specific styles to recommend beneath this product. If left unconfigured, the system will automatically match footwear from the same category.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Section Heading</label>
                <input
                  type="text"
                  value={form.customCopy?.relatedProductsHeading || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, relatedProductsHeading: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="Default: YOU MIGHT ALSO LIKE"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Supporting Subtitle</label>
                <input
                  type="text"
                  value={form.customCopy?.relatedProductsSubtitle || ''}
                  onChange={(e) =>
                    setForm({ ...form, customCopy: { ...form.customCopy, relatedProductsSubtitle: e.target.value } })
                  }
                  className="admin-input"
                  placeholder="e.g. Explore complementary silhouettes from our core drop."
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Select Related Footwear Silhouettes</label>
              <div
                style={{
                  maxHeight: '280px',
                  overflowY: 'auto',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {allProducts.map((p) => {
                  const isSelected = form.relatedProducts?.includes(p._id);
                  return (
                    <label
                      key={p._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: isSelected ? '#f1f5f9' : '#ffffff',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #cbd5e1' : '1px solid transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSelection = e.target.checked
                            ? [...(form.relatedProducts || []), p._id]
                            : (form.relatedProducts || []).filter((id) => id !== p._id);
                          setForm({ ...form, relatedProducts: newSelection });
                        }}
                      />
                      <img
                        src={p.defaultImages?.[0]?.url || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=100&q=80'}
                        alt={p.name}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          ₹{p.baseSalePrice} • {p.productType}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            GROUP 10: SEO & SOCIAL SHARING
            ============================================================== */}
        {activeTab === 'seo' && (
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: '#0f172a' }}>
              Group 10: Search Engine Optimization & Social Graph
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Canonical SEO titles, Open Graph cards for WhatsApp/Instagram sharing, and structured data generation.
            </p>

            <div className="admin-form-group">
              <label className="admin-label">SEO Meta Title (Recommended: &lt; 60 chars)</label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className="admin-input"
                placeholder={form.name ? `${form.name} — Waterproof Foam Footwear | CALZARE` : ''}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">SEO Meta Description (Recommended: 120-160 chars)</label>
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className="admin-textarea"
                placeholder="High-density closed-cell waterproof EVA foam footwear designed for modern street culture."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Open Graph (OG) Title for Social Sharing</label>
                <input
                  type="text"
                  value={form.ogTitle || ''}
                  onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                  className="admin-input"
                  placeholder="Leave blank to use SEO title"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Open Graph Description</label>
                <input
                  type="text"
                  value={form.ogDescription || ''}
                  onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                  className="admin-input"
                  placeholder="Leave blank to use SEO description"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <ImageUploadField
                label="Social Sharing Preview Image (OG Image)"
                description="Upload landscape image (1200x630 recommended) for WhatsApp/Facebook/Twitter previews"
                value={form.ogImage || form.defaultImages?.[0]?.url || ''}
                onChange={(url) => setForm({ ...form, ogImage: url })}
                aspectRatio="banner"
              />
            </div>

            {/* Google SERP Preview Card */}
            <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Google Search Result Preview
              </span>
              <div style={{ color: '#1a0dab', fontSize: '1.05rem', fontWeight: 600, textDecoration: 'underline', marginBottom: '2px', cursor: 'pointer' }}>
                {form.seoTitle || `${form.name || 'Footwear Silhouette'} — CALZARE Footwear`}
              </div>
              <div style={{ color: '#006621', fontSize: '0.78rem', marginBottom: '4px' }}>
                https://calzare.in/product/{form.slug || 'product-slug'}
              </div>
              <div style={{ color: '#4d5156', fontSize: '0.82rem', lineHeight: 1.4 }}>
                {form.seoDescription || form.shortDescription || 'Shop high-density waterproof closed-cell EVA foam footwear designed for modern street culture.'}
              </div>
            </div>
          </div>
        )}

        {/* Sticky Bottom Save Actions */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 40,
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            marginTop: '20px',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {form.name ? `Editing: ${form.name}` : 'Unsaved changes in product draft'}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={saving}
              className="admin-btn admin-btn-outline"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEditing ? 'Save & Publish Updates' : 'Publish Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
