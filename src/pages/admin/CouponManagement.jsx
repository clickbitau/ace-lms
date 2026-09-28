import { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  Tag, Plus, Trash2, Edit3, Search, CheckCircle2,
  AlertCircle, Calendar, Hash, Check, X, Percent, DollarSign
} from 'lucide-react';

export default function CouponManagement() {
  const { coupons, courses, addCoupon, updateCoupon, deleteCoupon } = useLms();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  // New Coupon Form
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState(20);
  const [description, setDescription] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxUses, setMaxUses] = useState(100);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const totalUses = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

  const filtered = useMemo(() => {
    return coupons.filter(c => {
      if (statusFilter === 'Active' && !c.isActive) return false;
      if (statusFilter === 'Inactive' && c.isActive) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.code.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [coupons, statusFilter, search]);

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Coupon code is required.');
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      setErrorMsg(`Coupon code "${cleanCode}" already exists.`);
      return;
    }

    addCoupon({
      code: cleanCode,
      type,
      value: Number(value),
      description: description.trim(),
      minOrderAmount: Number(minOrderAmount),
      maxUses: Number(maxUses),
      validUntil,
    });

    setModalOpen(false);
    setCode('');
    setDescription('');
    setValue(20);
    setErrorMsg('');
    setSuccessBanner(`Discount code "${cleanCode}" created successfully and is now active for student checkout!`);
    setTimeout(() => setSuccessBanner(''), 5000);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Coupons & Promotions</h1>
          <p>Create discount campaigns, manage promo codes, and track redemption metrics</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => { setModalOpen(true); setErrorMsg(''); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {successBanner && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--emerald)',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20
        }}>
          <CheckCircle2 size={16} /> {successBanner}
        </div>
      )}

      {/* Metrics Row */}
      <div className="stat-cards-row">
        <div className="metric-card">
          <span className="metric-label">Total Coupons</span>
          <div className="metric-value">{totalCoupons}</div>
          <span className="metric-subtext">All campaign codes</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Active Promos</span>
          <div className="metric-value" style={{ color: 'var(--emerald)' }}>{activeCoupons}</div>
          <span className="metric-subtext">Available at checkout</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Redemptions</span>
          <div className="metric-value" style={{ color: 'var(--cyan)' }}>{totalUses}</div>
          <span className="metric-subtext">Successfully applied</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      {/* Coupons Table Container */}
      <div className="data-table-container">
        {/* Filters Bar Toolbar */}
        <div className="table-filter-bar">
          <div className="input-with-icon" style={{ flex: '1 1 260px', minWidth: 200, maxWidth: 380 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="input"
              placeholder="Search code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 150 }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive / Expired</option>
          </select>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> coupon{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Coupons Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '16%', minWidth: 140 }}>Coupon Code</th>
                <th style={{ width: '12%', minWidth: 110 }}>Discount</th>
                <th style={{ width: '24%', minWidth: 180 }}>Description</th>
                <th style={{ width: '12%', minWidth: 100 }}>Redemptions</th>
                <th style={{ width: '10%', minWidth: 90 }}>Min Spend</th>
                <th style={{ width: '12%', minWidth: 110 }}>Valid Until</th>
                <th style={{ width: '8%', minWidth: 80 }}>Status</th>
                <th style={{ width: '8%', minWidth: 90, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={15} style={{ color: 'var(--cyan)' }} />
                      <strong style={{ fontSize: 13, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                        {c.code}
                      </strong>
                    </div>
                  </td>

                  <td>
                    <span style={{
                      fontWeight: 700, fontSize: 13,
                      color: c.type === 'percentage' ? '#f39c12' : 'var(--emerald)'
                    }}>
                      {c.type === 'percentage' ? `${c.value}% OFF` : `$${c.value} OFF`}
                    </span>
                  </td>

                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {c.description || '—'}
                  </td>

                  <td style={{ fontSize: 13, fontWeight: 600 }}>
                    {c.usedCount || 0} / {c.maxUses || '∞'}
                  </td>

                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.minOrderAmount > 0 ? `$${c.minOrderAmount}` : 'None'}
                  </td>

                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.validUntil || 'Never'}
                  </td>

                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 11,
                      fontWeight: 700,
                      background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: c.isActive ? 'var(--emerald)' : '#ef4444'
                    }}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button
                        onClick={() => updateCoupon(c.id, { isActive: !c.isActive })}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        title={c.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete coupon "${c.code}"?`)) {
                            deleteCoupon(c.id);
                          }
                        }}
                        className="btn btn-ghost btn-sm btn-icon"
                        style={{ color: '#ef4444' }}
                        title="Delete coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                  <Tag size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ margin: 0 }}>No coupon codes found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={18} style={{ color: 'var(--cyan)' }} /> Create Discount Code
              </h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Coupon Code (Uppercase):
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FLASH30"
                    style={{ width: '100%', textTransform: 'uppercase', fontWeight: 700 }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Discount Type:
                    </label>
                    <select
                      className="input"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="percentage">Percentage (% OFF)</option>
                      <option value="fixed">Fixed Amount ($ OFF)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Discount Value:
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={value}
                      min="1"
                      max={type === 'percentage' ? 100 : 1000}
                      onChange={(e) => setValue(e.target.value)}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Campaign Description:
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 20% off for new students"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Minimum Spend ($):
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Max Redemptions:
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Expiration Date:
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ color: '#ef4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={14} /> {errorMsg}
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
