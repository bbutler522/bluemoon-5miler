'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';

type PromoCode = {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
};

type EditablePromo = PromoCode & { dirty?: boolean };

const emptyForm = {
  code: '',
  discount_type: 'fixed' as 'fixed' | 'percentage',
  discount_value: 3,
  max_uses: '',
  is_active: true,
  valid_from: '',
  valid_until: '',
};

export default function AdminPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<EditablePromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadPromoCodes() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load promo codes');
      setPromoCodes(data.promoCodes || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPromoCodes();
  }, []);

  async function createPromoCode(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const payload = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_uses: form.max_uses.trim() ? Number(form.max_uses) : null,
        is_active: form.is_active,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
      };
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create promo code');
      setPromoCodes((prev) => [data.promoCode, ...prev]);
      setForm(emptyForm);
    } catch (e: any) {
      setError(e.message || 'Failed to create promo code');
    } finally {
      setCreating(false);
    }
  }

  function updateLocalPromo(id: string, updates: Partial<EditablePromo>) {
    setPromoCodes((prev) =>
      prev.map((promo) => (promo.id === id ? { ...promo, ...updates, dirty: true } : promo))
    );
  }

  async function savePromoCode(promo: EditablePromo) {
    setSavingId(promo.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promo.code,
          discount_type: promo.discount_type,
          discount_value: Number(promo.discount_value),
          max_uses: promo.max_uses,
          is_active: promo.is_active,
          valid_from: promo.valid_from || null,
          valid_until: promo.valid_until || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save promo code');
      setPromoCodes((prev) =>
        prev.map((row) => (row.id === promo.id ? { ...row, ...data.promoCode, dirty: false } : row))
      );
    } catch (e: any) {
      setError(e.message || 'Failed to save promo code');
    } finally {
      setSavingId(null);
    }
  }

  async function deletePromoCode(id: string) {
    if (!window.confirm('Delete this promo code? This cannot be undone.')) return;
    setSavingId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete promo code');
      setPromoCodes((prev) => prev.filter((promo) => promo.id !== id));
    } catch (e: any) {
      setError(e.message || 'Failed to delete promo code');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-moonlight">Promo Codes</h2>
          <p className="text-xs text-stardust/40 mt-1">
            Create and manage registration promo codes from admin.
          </p>
        </div>
      </div>

      {error && (
        <div className="card p-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={createPromoCode} className="card p-5 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
          Add Promo Code
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="input-field"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="CODE"
            required
          />
          <select
            className="input-field"
            value={form.discount_type}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, discount_type: e.target.value as 'fixed' | 'percentage' }))
            }
          >
            <option value="fixed">Fixed amount ($)</option>
            <option value="percentage">Percentage (%)</option>
          </select>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="input-field"
            value={form.discount_value}
            onChange={(e) => setForm((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
            placeholder="Discount value"
            required
          />
          <input
            type="number"
            min="1"
            step="1"
            className="input-field"
            value={form.max_uses}
            onChange={(e) => setForm((prev) => ({ ...prev, max_uses: e.target.value }))}
            placeholder="Max uses (optional)"
          />
          <input
            type="datetime-local"
            className="input-field"
            value={form.valid_from}
            onChange={(e) => setForm((prev) => ({ ...prev, valid_from: e.target.value }))}
          />
          <input
            type="datetime-local"
            className="input-field"
            value={form.valid_until}
            onChange={(e) => setForm((prev) => ({ ...prev, valid_until: e.target.value }))}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-stardust/80">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
          />
          Active
        </label>
        <button type="submit" className="btn-primary !text-xs inline-flex items-center gap-2" disabled={creating}>
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create
        </button>
      </form>

      <div className="card p-5 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
          Existing Promo Codes
        </p>
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-stardust/40" />
          </div>
        ) : promoCodes.length === 0 ? (
          <p className="text-sm text-stardust/40 text-center py-6">No promo codes yet.</p>
        ) : (
          <div className="space-y-3">
            {promoCodes.map((promo) => (
              <div key={promo.id} className="border border-lunar-400/10 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="input-field"
                    value={promo.code}
                    onChange={(e) => updateLocalPromo(promo.id, { code: e.target.value.toUpperCase() })}
                  />
                  <select
                    className="input-field"
                    value={promo.discount_type}
                    onChange={(e) =>
                      updateLocalPromo(promo.id, {
                        discount_type: e.target.value as 'fixed' | 'percentage',
                      })
                    }
                  >
                    <option value="fixed">Fixed amount ($)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="input-field"
                    value={promo.discount_value}
                    onChange={(e) => updateLocalPromo(promo.id, { discount_value: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="input-field"
                    value={promo.max_uses ?? ''}
                    onChange={(e) =>
                      updateLocalPromo(promo.id, {
                        max_uses: e.target.value.trim() ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Max uses (optional)"
                  />
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={promo.valid_from ? promo.valid_from.slice(0, 16) : ''}
                    onChange={(e) => updateLocalPromo(promo.id, { valid_from: e.target.value || null })}
                  />
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={promo.valid_until ? promo.valid_until.slice(0, 16) : ''}
                    onChange={(e) => updateLocalPromo(promo.id, { valid_until: e.target.value || null })}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-xs text-stardust/80">
                      <input
                        type="checkbox"
                        checked={promo.is_active}
                        onChange={(e) => updateLocalPromo(promo.id, { is_active: e.target.checked })}
                      />
                      Active
                    </label>
                    <span className="text-xs text-stardust/50">
                      Uses: {promo.current_uses}
                      {promo.max_uses !== null ? ` / ${promo.max_uses}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => savePromoCode(promo)}
                      className="btn-secondary !text-xs inline-flex items-center gap-2"
                      disabled={savingId === promo.id}
                    >
                      {savingId === promo.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePromoCode(promo.id)}
                      className="btn-secondary !text-xs inline-flex items-center gap-2 text-red-300 hover:text-red-200"
                      disabled={savingId === promo.id}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
