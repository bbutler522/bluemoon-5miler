'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create form
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  async function fetchCodes() {
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCodes(data.promoCodes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCodes();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          discount_type: discountType,
          discount_value: parseFloat(discountValue),
          max_uses: maxUses ? parseInt(maxUses, 10) : null,
          valid_from: validFrom || null,
          valid_until: validUntil || null,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccess(`Code "${data.promoCode.code}" created`);
      setShowCreate(false);
      setNewCode('');
      setDiscountValue('');
      setMaxUses('');
      setValidFrom('');
      setValidUntil('');
      fetchCodes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(code: PromoCode) {
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: code.id, is_active: !code.is_active }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      fetchCodes();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-stardust/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-moonlight">Promo Codes</h2>
          <p className="text-xs text-stardust/40 mt-1">{codes.length} codes</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5"
        >
          <Plus size={14} />
          New Code
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-green-400" />
          <p className="text-xs text-green-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <XCircle size={14} className="text-red-400" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="card p-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
            Create Promo Code
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label-field">Code *</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="input-field font-mono"
                placeholder="EARLYBIRD"
                required
              />
            </div>
            <div>
              <label className="label-field">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="label-field">
                Discount Value * ({discountType === 'percentage' ? '%' : '$'})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="input-field"
                placeholder={discountType === 'percentage' ? '20' : '10'}
                required
              />
            </div>
            <div>
              <label className="label-field">Max Uses (blank = unlimited)</label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="input-field"
                placeholder="50"
              />
            </div>
            <div>
              <label className="label-field">Valid From</label>
              <input
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Valid Until</label>
              <input
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="btn-primary !py-2 !px-5 !text-xs flex items-center gap-1.5"
            >
              {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Create Code
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn-secondary !py-2 !px-5 !text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Codes list */}
      <div className="space-y-3">
        {codes.length === 0 ? (
          <div className="card p-8 text-center">
            <Tag size={24} className="text-stardust/20 mx-auto mb-3" />
            <p className="text-sm text-stardust/30">No promo codes yet</p>
          </div>
        ) : (
          codes.map((code) => (
            <div key={code.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-base font-semibold ${
                        code.is_active ? 'text-moonlight' : 'text-stardust/30 line-through'
                      }`}
                    >
                      {code.code}
                    </span>
                    <span className="text-[10px] text-stardust/40 bg-midnight-800/60 rounded px-2 py-0.5">
                      {code.discount_type === 'percentage'
                        ? `${code.discount_value}% off`
                        : `$${code.discount_value} off`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Usage */}
                  <div className="text-right">
                    <p className="text-xs text-stardust/40">
                      {code.current_uses}
                      {code.max_uses !== null ? ` / ${code.max_uses}` : ''} uses
                    </p>
                    {code.max_uses !== null && (
                      <div className="w-20 h-1 bg-midnight-800/60 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-midnight-400/70 rounded-full"
                          style={{ width: `${Math.min(100, (code.current_uses / code.max_uses) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Validity dates */}
                  {(code.valid_from || code.valid_until) && (
                    <div className="text-right hidden lg:block">
                      {code.valid_from && (
                        <p className="text-[10px] text-stardust/30">
                          From: {new Date(code.valid_from).toLocaleDateString()}
                        </p>
                      )}
                      {code.valid_until && (
                        <p className="text-[10px] text-stardust/30">
                          Until: {new Date(code.valid_until).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(code)}
                    className="text-stardust/40 hover:text-moonlight transition-colors"
                    title={code.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {code.is_active ? (
                      <ToggleRight size={24} className="text-green-400" />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
