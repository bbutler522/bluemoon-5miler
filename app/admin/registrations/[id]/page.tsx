'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Save,
  Loader2,
  User,
  Phone,
  Mail,
  Calendar,
  Shirt,
  Hash,
  CreditCard,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { SHIRT_SIZES } from '@/lib/constants';

const statusOptions = ['pending', 'completed', 'failed', 'refunded'];

const statusStyles: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', label: 'Confirmed' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', label: 'Failed' },
  refunded: { icon: XCircle, color: 'text-stardust/50', bg: 'bg-stardust/5 border-stardust/10', label: 'Refunded' },
};

export default function AdminRegistrationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [reg, setReg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    shirt_size: '',
    payment_status: '',
    bib_number: '',
  });

  useEffect(() => {
    fetch(`/api/admin/registrations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReg(data.registration);
        setForm({
          first_name: data.registration.first_name || '',
          last_name: data.registration.last_name || '',
          email: data.registration.email || '',
          phone: data.registration.phone || '',
          emergency_contact_name: data.registration.emergency_contact_name || '',
          emergency_contact_phone: data.registration.emergency_contact_phone || '',
          shirt_size: data.registration.shirt_size || '',
          payment_status: data.registration.payment_status || '',
          bib_number: data.registration.bib_number ? String(data.registration.bib_number) : '',
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updates: any = { ...form };
      if (updates.bib_number) {
        updates.bib_number = parseInt(updates.bib_number, 10);
      } else {
        updates.bib_number = null;
      }

      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setReg(data.registration);
      setEditMode(false);
      setSuccess('Registration updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-stardust/40" />
      </div>
    );
  }

  if (error && !reg) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <Link href="/admin/registrations" className="text-xs text-stardust/40 hover:text-moonlight mt-4 inline-block">
          ← Back to Registrations
        </Link>
      </div>
    );
  }

  if (!reg) return null;

  const st = statusStyles[reg.payment_status] || statusStyles.pending;
  const StatusIcon = st.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stardust/40">
        <Link href="/admin/registrations" className="hover:text-moonlight transition-colors flex items-center gap-1">
          <ChevronLeft size={14} />
          Registrations
        </Link>
        <span>/</span>
        <span className="text-stardust/60">{reg.first_name} {reg.last_name}</span>
      </div>

      {/* Header with status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-moonlight">
            {reg.first_name} {reg.last_name}
          </h2>
          <p className="text-xs text-stardust/40 mt-1">{reg.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${st.bg} ${st.color}`}>
            <StatusIcon size={14} />
            {st.label}
          </span>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="btn-secondary !py-2 !px-4 !text-xs">
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(false)}
                className="btn-secondary !py-2 !px-4 !text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-green-400" />
          <p className="text-xs text-green-400">{success}</p>
        </div>
      )}
      {error && reg && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Detail grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <div className="card p-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
            Personal Information
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">First Name</label>
              {editMode ? (
                <input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-sm text-moonlight">{reg.first_name}</p>
              )}
            </div>
            <div>
              <label className="label-field">Last Name</label>
              {editMode ? (
                <input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-sm text-moonlight">{reg.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label-field">Email</label>
            {editMode ? (
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-sm text-moonlight">{reg.email}</p>
            )}
          </div>

          <div>
            <label className="label-field">Phone</label>
            {editMode ? (
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-sm text-stardust/60">{reg.phone || '—'}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Gender</label>
              <p className="text-sm text-stardust/60">{reg.gender || '—'}</p>
            </div>
            <div>
              <label className="label-field">Date of Birth</label>
              <p className="text-sm text-stardust/60">{reg.date_of_birth || '—'}</p>
            </div>
          </div>
        </div>

        {/* Race & Payment info */}
        <div className="card p-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
            Race & Payment
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Payment Status</label>
              {editMode ? (
                <select
                  value={form.payment_status}
                  onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
                  className="input-field"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <p className={`text-sm font-medium ${st.color}`}>{st.label}</p>
              )}
            </div>
            <div>
              <label className="label-field">Amount Paid</label>
              <p className="text-sm font-mono text-moonlight">
                ${Number(reg.amount_paid).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Bib Number</label>
              {editMode ? (
                <input
                  type="number"
                  value={form.bib_number}
                  onChange={(e) => setForm({ ...form, bib_number: e.target.value })}
                  className="input-field"
                  placeholder="Auto-assigned"
                />
              ) : (
                <p className="text-sm font-mono text-moonlight">
                  {reg.bib_number ? `#${reg.bib_number}` : 'Not assigned'}
                </p>
              )}
            </div>
            <div>
              <label className="label-field">Shirt Size</label>
              {editMode ? (
                <select
                  value={form.shirt_size}
                  onChange={(e) => setForm({ ...form, shirt_size: e.target.value })}
                  className="input-field"
                >
                  <option value="">Not selected</option>
                  {SHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-stardust/60">{reg.shirt_size || '—'}</p>
              )}
            </div>
          </div>

          {reg.promo_codes && (
            <div>
              <label className="label-field">Promo Code</label>
              <p className="text-sm text-moonlight flex items-center gap-2">
                <Tag size={12} className="text-stardust/40" />
                {reg.promo_codes.code}
                <span className="text-[10px] text-stardust/40 bg-midnight-800/60 rounded px-2 py-0.5">
                  {reg.promo_codes.discount_type === 'percentage'
                    ? `${reg.promo_codes.discount_value}% off`
                    : `$${reg.promo_codes.discount_value} off`}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="label-field">Stripe Reference</label>
            <p className="text-xs font-mono text-stardust/30 break-all">
              {reg.stripe_payment_intent_id || '—'}
            </p>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="card p-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
            Emergency Contact
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Name</label>
              {editMode ? (
                <input
                  value={form.emergency_contact_name}
                  onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-sm text-stardust/60">{reg.emergency_contact_name || '—'}</p>
              )}
            </div>
            <div>
              <label className="label-field">Phone</label>
              {editMode ? (
                <input
                  value={form.emergency_contact_phone}
                  onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="text-sm text-stardust/60">{reg.emergency_contact_phone || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="card p-6 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
            Activity
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-stardust/20" />
              <div>
                <p className="text-xs text-stardust/60">Registered</p>
                <p className="text-xs text-stardust/30">
                  {new Date(reg.created_at).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-stardust/20" />
              <div>
                <p className="text-xs text-stardust/60">Last Updated</p>
                <p className="text-xs text-stardust/30">
                  {new Date(reg.updated_at).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-stardust/20" />
              <div>
                <p className="text-xs text-stardust/60">Registration ID</p>
                <p className="text-[10px] font-mono text-stardust/20 break-all">{reg.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
