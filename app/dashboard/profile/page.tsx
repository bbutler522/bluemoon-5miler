'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { SHIRT_SIZES } from '@/lib/constants';
import {
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Calendar,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    shirt_size: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setUser(data.user);
        setRegistration(data.registration);

        if (data.registration) {
          setForm({
            first_name: data.registration.first_name || '',
            last_name: data.registration.last_name || '',
            phone: data.registration.phone || '',
            emergency_contact_name: data.registration.emergency_contact_name || '',
            emergency_contact_phone: data.registration.emergency_contact_phone || '',
            shirt_size: data.registration.shirt_size || '',
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setRegistration(data.registration);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-stardust/40" />
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 pt-24 pb-20">
      <div className="max-w-xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-stardust/40 hover:text-moonlight transition-colors mb-6"
        >
          <ChevronLeft size={14} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl text-moonlight">Your Profile</h1>
          <p className="text-xs text-stardust/40 mt-1">
            Update your registration details
          </p>
        </div>

        {/* Account info (read-only) */}
        <div className="card p-6 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold mb-4">
            Account
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={14} className="text-stardust/30" />
              <div>
                <p className="text-[10px] text-stardust/30 uppercase tracking-widest">Email</p>
                <p className="text-sm text-moonlight">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={14} className="text-stardust/30" />
              <div>
                <p className="text-[10px] text-stardust/30 uppercase tracking-widest">Member Since</p>
                <p className="text-sm text-stardust/80">
                  {new Date(user?.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2 mb-6">
            <CheckCircle2 size={14} className="text-green-400" />
            <p className="text-xs text-green-400">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {registration ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal info */}
            <div className="card p-6 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
                Personal Information
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">First Name</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            {/* Emergency contact */}
            <div className="card p-6 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
                Emergency Contact
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Contact Name</label>
                  <input
                    type="text"
                    value={form.emergency_contact_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        emergency_contact_name: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Contact Phone</label>
                  <input
                    type="tel"
                    value={form.emergency_contact_phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        emergency_contact_phone: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Race options */}
            <div className="card p-6 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-stardust/40 font-semibold">
                Race Options
              </p>
              <div>
                <label className="label-field">Shirt Size</label>
                <select
                  value={form.shirt_size}
                  onChange={(e) =>
                    setForm({ ...form, shirt_size: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select size...</option>
                  {SHIRT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </form>
        ) : (
          <div className="card p-8 text-center">
            <User size={24} className="text-stardust/20 mx-auto mb-3" />
            <p className="text-sm text-stardust/40">
              No registration to edit.{' '}
              <Link href="/register" className="text-moonlight underline">
                Register first
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
