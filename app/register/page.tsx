'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Moon } from '@/components/Moon';
import MagicLinkForm from '@/components/MagicLinkForm';
import { RACE_INFO, SHIRT_SIZES, GENDER_OPTIONS, SHIRT_PREORDER_PRICE, PROMO_DISCOUNT } from '@/lib/constants';
import { Loader2, CheckCircle2, CheckCircle, XCircle, Tag } from 'lucide-react';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const DRAFT_KEY = 'blue-moon-race:register-draft:v2';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authEmailHint, setAuthEmailHint] = useState<string>('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  // Shirt pre-order
  const [shirtPreorder, setShirtPreorder] = useState(false);
  const [shirtSize, setShirtSize] = useState('');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Derived totals
  const entryPrice = RACE_INFO.price - promoDiscount;
  const shirtTotal = shirtPreorder ? SHIRT_PREORDER_PRICE : 0;
  const total = entryPrice + shirtTotal;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (typeof draft?.firstName === 'string') setFirstName(draft.firstName);
        if (typeof draft?.lastName === 'string') setLastName(draft.lastName);
        if (typeof draft?.email === 'string') setEmail(draft.email);
        if (typeof draft?.phone === 'string') setPhone(draft.phone);
        if (typeof draft?.emergencyName === 'string') setEmergencyName(draft.emergencyName);
        if (typeof draft?.emergencyPhone === 'string') setEmergencyPhone(draft.emergencyPhone);
        if (typeof draft?.dob === 'string') setDob(draft.dob);
        if (typeof draft?.gender === 'string') setGender(draft.gender);
        if (typeof draft?.shirtPreorder === 'boolean') setShirtPreorder(draft.shirtPreorder);
        if (typeof draft?.shirtSize === 'string') setShirtSize(draft.shirtSize);
      }
    } catch {
      // ignore draft parsing errors
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        if (data.user.email) setEmail(data.user.email);
        const meta = data.user.user_metadata;
        if (meta?.full_name) {
          const parts = meta.full_name.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
      }
    });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          firstName, lastName, email, phone,
          emergencyName, emergencyPhone, dob, gender,
          shirtPreorder, shirtSize,
        })
      );
    } catch {
      // ignore quota / privacy mode errors
    }
  }, [firstName, lastName, email, phone, emergencyName, emergencyPhone, dob, gender, shirtPreorder, shirtSize]);

  // Clear shirt size when pre-order is toggled off
  useEffect(() => {
    if (!shirtPreorder) setShirtSize('');
  }, [shirtPreorder]);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoStatus('checking');
    try {
      const res = await fetch('/api/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoStatus('valid');
        setPromoDiscount(data.discount);
      } else {
        setPromoStatus('invalid');
        setPromoDiscount(0);
      }
    } catch {
      setPromoStatus('invalid');
      setPromoDiscount(0);
    }
  }

  function handlePromoKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPromo();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Please confirm your email to continue.');
      setLoading(false);
      return;
    }

    if (shirtPreorder && !shirtSize) {
      setError('Please select a shirt size to add the pre-order.');
      setLoading(false);
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
          shirt_size: shirtPreorder ? shirtSize : null,
          shirt_preorder: shirtPreorder,
          promo_code: promoStatus === 'valid' ? promoCode : '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.demo && data.redirect) {
        try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
        router.push(data.redirect);
        return;
      }

      if (data.checkout_url) {
        try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
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
          <h1 className="font-display text-3xl text-moonlight mb-3">You&apos;re in!</h1>
          <p className="text-sm text-stardust/100 mb-8">
            Your registration is confirmed. Check your email for details and head to your dashboard.
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="min-h-screen px-6 pt-24 pb-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="mx-auto w-14 h-14 mb-6"><Moon /></div>
            <h1 className="font-display text-3xl sm:text-4xl text-moonlight mb-2">Register</h1>
            <p className="text-sm text-stardust/100">Blue Moon 5 Miler — {RACE_INFO.date}</p>
          </div>
          <div className="card p-6">
            <MagicLinkForm
              redirectTo="/register"
              initialEmail={authEmailHint || email}
              subtitle="Enter your email to get a magic link. After you click it, you'll come right back here to complete your registration."
              onSent={(sentEmail) => setAuthEmailHint(sentEmail)}
            />
          </div>
          <p className="text-[11px] text-stardust/50 text-center mt-4">
            Tip: you can leave this tab open — your form progress will be saved on this device.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 pt-24 pb-20">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 mb-6"><Moon /></div>
          <h1 className="font-display text-3xl sm:text-4xl text-moonlight mb-2">Register</h1>
          <p className="text-sm text-stardust/100">Blue Moon 5 Miler — {RACE_INFO.date}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <fieldset className="space-y-4">
            <legend className="label-field mb-2">Personal Information</legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label-field">Last Name *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" required />
              </div>
            </div>

            <div>
              <label className="label-field">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
            </div>

            <div>
              <label className="label-field">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="(555) 555-5555" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">Contact Phone</label>
                <input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="input-field" />
              </div>
            </div>
          </fieldset>

          {/* Race options — T-shirt pre-order */}
          <fieldset className="space-y-4">
            <legend className="label-field mb-2">Add-ons</legend>

            {/* Shirt toggle card */}
            <label className={`card px-5 py-4 flex items-start gap-4 cursor-pointer transition-colors ${shirtPreorder ? 'border-lunar-400/30 bg-midnight-800/60' : ''}`}>
              <input
                type="checkbox"
                checked={shirtPreorder}
                onChange={(e) => setShirtPreorder(e.target.checked)}
                className="mt-1 accent-moonlight flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-moonlight">T-Shirt Pre-Order</p>
                  <span className="text-sm text-moonlight font-display">+${SHIRT_PREORDER_PRICE}</span>
                </div>
                <p className="text-xs text-stardust/60 mt-0.5">Optional — pick up at the race.</p>

                {/* Size selector — slides in when checked */}
                {shirtPreorder && (
                  <div className="mt-3">
                    <label className="label-field mb-1">Size *</label>
                    <select
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value)}
                      className="input-field"
                      required={shirtPreorder}
                    >
                      <option value="">Select size...</option>
                      {SHIRT_SIZES.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </label>
          </fieldset>

          {/* Price summary + promo code */}
          <div className="card p-5 space-y-3">
            {/* Race entry */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-stardust/100">Race entry</span>
              <span className="text-moonlight">${RACE_INFO.price.toFixed(2)}</span>
            </div>

            {/* Shirt add-on */}
            {shirtPreorder && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-stardust/100">T-shirt pre-order{shirtSize ? ` (${shirtSize})` : ''}</span>
                <span className="text-moonlight">+${SHIRT_PREORDER_PRICE.toFixed(2)}</span>
              </div>
            )}

            {/* Promo code row */}
            <div className="pt-1">
              <label className="label-field mb-1.5 flex items-center gap-1.5">
                <Tag size={11} />
                Promo code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    if (promoStatus !== 'idle') {
                      setPromoStatus('idle');
                      setPromoDiscount(0);
                    }
                  }}
                  onKeyDown={handlePromoKeyDown}
                  className="input-field flex-1"
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={!promoCode.trim() || promoStatus === 'checking'}
                  className="btn-secondary px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {promoStatus === 'checking' ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>

              {promoStatus === 'valid' && (
                <p className="mt-1.5 text-xs text-green-400 flex items-center gap-1.5">
                  <CheckCircle size={12} /> Code applied — ${promoDiscount.toFixed(2)} off
                </p>
              )}
              {promoStatus === 'invalid' && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
                  <XCircle size={12} /> Invalid promo code
                </p>
              )}
            </div>

            {/* Promo discount line */}
            {promoStatus === 'valid' && promoDiscount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-400/80">Promo discount</span>
                <span className="text-green-400">−${promoDiscount.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-lunar-400/10 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-moonlight">Total</span>
              <span className="font-display text-xl text-moonlight">${total.toFixed(2)}</span>
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
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Processing...
              </>
            ) : isDemoMode ? (
              `Register (Demo) — $${total.toFixed(2)}`
            ) : (
              `Pay $${total.toFixed(2)} & Register`
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
