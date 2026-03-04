'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Moon } from '@/components/Moon';
import { RACE_INFO } from '@/lib/constants';
import { SHIRT_SIZES, GENDER_OPTIONS } from '@/lib/constants';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [shirtSize, setShirtSize] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setEmail(data.user.email || '');
        const meta = data.user.user_metadata;
        if (meta?.full_name) {
          const parts = meta.full_name.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      router.push(`/login?redirect=/register`);
      return;
    }

    try {
      const res = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          date_of_birth: dob || null,
          gender: gender || null,
          shirt_size: shirtSize || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Demo mode — redirect directly to dashboard
      if (data.demo && data.redirect) {
        router.push(data.redirect);
        return;
      }

      // Live mode — redirect to Stripe Payment Link
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 pt-16 pb-20">
        <div className="max-w-md text-center">
          <CheckCircle2 size={48} className="text-green-400 mx-auto mb-6" />
          <h1 className="font-display text-3xl text-moonlight mb-3">
            You&apos;re in!
          </h1>
          <p className="text-sm text-stardust/50 mb-8">
            Your registration is confirmed. Check your email for details and head
            to your dashboard to see your race info.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 pt-24 pb-20">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 mb-6">
            <Moon />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-moonlight mb-2">
            Register
          </h1>
          <p className="text-sm text-stardust/50">
            Blue Moon 5 Miler — {RACE_INFO.date}
          </p>
        </div>

        {/* Auth notice */}
        {!user && (
          <div className="card p-5 mb-8 flex items-start gap-3">
            <AlertCircle size={18} className="text-stardust/60 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-moonlight font-semibold mb-1">
                Sign in required
              </p>
              <p className="text-xs text-stardust/50">
                You&apos;ll need an account to register.{' '}
                <button
                  onClick={() => router.push('/login?redirect=/register')}
                  className="text-moonlight underline"
                >
                  Sign in or create one
                </button>
                .
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <fieldset className="space-y-4">
            <legend className="label-field mb-2">Personal Information</legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label-field">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-field">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-field">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="(555) 555-5555"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select...</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Emergency contact */}
          <fieldset className="space-y-4">
            <legend className="label-field mb-2">Emergency Contact</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </fieldset>

          {/* Race options */}
          <fieldset className="space-y-4">
            <legend className="label-field mb-2">Race Options</legend>
            <div>
              <label className="label-field">Shirt Size</label>
              <select
                value={shirtSize}
                onChange={(e) => setShirtSize(e.target.value)}
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
          </fieldset>

          {/* Price summary */}
          <div className="card p-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stardust/60">Race entry</span>
              <span className="text-sm text-moonlight">
                ${RACE_INFO.price.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-lunar-400/10 mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-moonlight">Total</span>
              <span className="font-display text-xl text-moonlight">
                ${RACE_INFO.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !user}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Processing...
              </>
            ) : isDemoMode ? (
              `Register (Demo) — $${RACE_INFO.price.toFixed(2)}`
            ) : (
              `Pay $${RACE_INFO.price.toFixed(2)} & Register`
            )}
          </button>

          <p className="text-[11px] text-stardust/30 text-center">
            {isDemoMode
              ? 'Demo mode — registration is simulated. No payment required.'
              : "Payment processed securely via Stripe. You'll be redirected to complete payment."}
          </p>
        </form>
      </div>
    </section>
  );
}
