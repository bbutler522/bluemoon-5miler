'use client';

import { FormEvent, useMemo, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Mail, MessageSquareWarning, Moon, Send, User } from 'lucide-react';

type ContactTopic = 'general' | 'registration' | 'billing' | 'other';

const TOPIC_OPTIONS: Array<{ value: ContactTopic; label: string }> = [
  { value: 'general', label: 'General question' },
  { value: 'registration', label: 'Registration issue' },
  { value: 'billing', label: 'Payment / billing issue' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<ContactTopic>('general');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const missingConfig = useMemo(() => {
    return (
      !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
      !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
      !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('idle');
    setErrorText('');

    if (missingConfig) {
      setStatus('error');
      setErrorText('Contact form is not configured yet. Please try again shortly.');
      return;
    }

    setIsSending(true);

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
        {
          from_name: name.trim(),
          from_email: email.trim(),
          topic,
          message: message.trim(),
          submitted_at: new Date().toISOString(),
        },
        {
          publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string,
        }
      );

      setStatus('success');
      setName('');
      setEmail('');
      setTopic('general');
      setMessage('');
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('error');
      setErrorText('Could not send your message right now. Please try again in a bit.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="relative min-h-screen px-6 pt-24 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 mb-6 rounded-full border border-lunar-400/15 bg-midnight-900/60 flex items-center justify-center">
            <Moon size={24} className="text-stardust/90" />
          </div>
          <p className="label-field mb-3">Contact</p>
          <h1 className="font-display text-3xl sm:text-4xl text-moonlight mb-3">
            Questions? We can help.
          </h1>
          <p className="text-sm text-stardust/80 max-w-xl mx-auto leading-relaxed">
            Use this form if you have any race questions or run into registration issues.
            We will get back to you as soon as we can.
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <fieldset className="space-y-4">
              <legend className="label-field mb-2">Your Info</legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="label-field block mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stardust/40" />
                    <input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      className="input-field pl-10"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label-field block mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stardust/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="input-field pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <label htmlFor="name" className="label-field block mb-0">
                Topic
              </label>
              <select
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value as ContactTopic)}
                className="input-field"
              >
                {TOPIC_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="message" className="label-field block mb-2">
                Message
              </label>
              <div className="relative">
                <MessageSquareWarning size={16} className="absolute left-3 top-3.5 text-stardust/40" />
                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  rows={6}
                  className="input-field pl-10 py-3 resize-y min-h-[140px]"
                  placeholder="Tell us what is going on."
                />
              </div>
            </fieldset>

            {status === 'success' && (
              <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-4 py-3">
                Thanks, your message was sent successfully.
              </p>
            )}

            {status === 'error' && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-3">
                {errorText}
              </p>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="btn-primary !w-full sm:!w-auto inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send size={14} />
              {isSending ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
