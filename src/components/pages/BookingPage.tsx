import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Phone, RefreshCw } from 'lucide-react';
import { Theme } from '../../theme';
import Button from '../ui/Button';
import { hasSupabase, supabase } from '../../lib/supabase';
import { submitPartyInquiry, type PartyInquiryType } from '../../lib/partyInquiry';

interface BookingPageProps {
  theme: Theme;
}

type PartyOption = PartyInquiryType;

interface FormState {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  event_time: string;
  head_count: string;
  details: string;
  website: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  event_date: '',
  event_time: '',
  head_count: '',
  details: '',
  website: '',
};

const OPTIONS: { id: PartyOption; label: string; blurb: string }[] = [
  { id: 'catering', label: 'Catering', blurb: 'Off-site or drop-off for your group.' },
  { id: 'venue', label: 'Book the venue', blurb: 'Private party, rehearsal dinner, celebration.' },
  { id: 'table', label: 'Reserve a table', blurb: 'Groups up to 20 — Wed through Sat.' },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const BookingPage: React.FC<BookingPageProps> = ({ theme }) => {
  const [option, setOption] = useState<PartyOption>('catering');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDate = todayIso();
  const online = hasSupabase() && !!supabase;

  const setField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  useEffect(() => {
    setError(null);
  }, [option]);

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme.textMuted}`;
  const inputClass = `w-full px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[color:var(--fs-nav-active-text)]/30 border`;
  const placeholderStyle = theme.isDark ? 'placeholder:text-[#6b6560]' : 'placeholder:text-[#8a8580]';
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--fs-input-bg)',
    borderColor: 'var(--fs-input-border)',
    color: 'var(--fs-page-text)',
    borderRadius: 'var(--fs-radius)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!online || !supabase) {
      setError('Online booking is not configured yet. Call 781-848-4448 and we’ll help you directly.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const headCount = form.head_count ? parseInt(form.head_count, 10) : undefined;

    const result = await submitPartyInquiry(supabase, {
      inquiry_type: option,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      event_date: form.event_date || undefined,
      event_time: form.event_time || undefined,
      head_count: headCount,
      details: form.details.trim() || undefined,
      website: form.website,
    });

    setSubmitting(false);

    if (result.ok) {
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } else {
      setError(result.message);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm(EMPTY_FORM);
    setError(null);
  };

  return (
    <div
      className="font-bar min-h-[60vh] py-10 sm:py-14"
      style={{ backgroundColor: 'var(--fs-page-bg)' }}
    >
      <div className="max-w-xl mx-auto px-5 sm:px-8">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${theme.textMuted}`}>
          Host your party
        </p>
        <h2
          className="font-barDisplay text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: 'var(--fs-page-text)' }}
        >
          Tell us what you’re planning.
        </h2>
        <p className={`text-sm mb-8 leading-relaxed ${theme.textMuted}`}>
          We’ll confirm by email or phone — usually within one business day. Open Wed–Sat, 4PM–1AM.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          {OPTIONS.map(({ id, label, blurb }) => {
            const active = option === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setOption(id)}
                className={`flex-1 text-left px-4 py-3 border-2 transition-all ${active ? 'border-[color:var(--fs-footer-schedule-border)] bg-[color:var(--fs-footer-schedule-bg)]/10' : 'border-[color:var(--fs-border)] hover:border-[color:var(--fs-nav-active-border)]'}`}
                style={{ borderRadius: 'var(--fs-radius)' }}
              >
                <span className={`block text-sm font-bold uppercase tracking-wider ${active ? 'text-[color:var(--fs-nav-active-text)]' : theme.text}`}>
                  {label}
                </span>
                <span className={`block text-[11px] mt-1 leading-snug ${theme.textMuted}`}>{blurb}</span>
              </button>
            );
          })}
        </div>

        {submitted ? (
          <div
            className="py-10 px-6 text-center border-2 space-y-4"
            style={{ borderColor: 'var(--fs-border)', borderRadius: 'var(--fs-radius)' }}
          >
            <p className={`font-barDisplay text-xl font-bold ${theme.text}`}>Request sent.</p>
            <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
              Thanks — we got your details and will reach out soon to confirm.
            </p>
            <Button type="button" variant="secondary" size="sm" onClick={resetForm}>
              Send another request
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="party-name">Name</label>
                <input
                  id="party-name"
                  required
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className={`${inputClass} ${placeholderStyle}`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="party-email">Email</label>
                <input
                  id="party-email"
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={`${inputClass} ${placeholderStyle}`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="party-phone">Phone</label>
                <input
                  id="party-phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="781-555-0100"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className={`${inputClass} ${placeholderStyle}`}
                  style={inputStyle}
                />
              </div>
            </div>

            {option === 'catering' && (
              <>
                <div>
                  <label className={labelClass} htmlFor="party-details">What do you want?</label>
                  <textarea
                    id="party-details"
                    required
                    rows={3}
                    placeholder="Menu ideas, dietary needs, delivery address if off-site…"
                    value={form.details}
                    onChange={(e) => setField('details', e.target.value)}
                    className={`${inputClass} resize-y ${placeholderStyle}`}
                    style={inputStyle}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="party-catering-date">When to feed</label>
                    <input
                      id="party-catering-date"
                      required
                      type="date"
                      min={minDate}
                      value={form.event_date}
                      onChange={(e) => setField('event_date', e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="party-headcount">Head count</label>
                    <input
                      id="party-headcount"
                      required
                      type="number"
                      min={1}
                      max={500}
                      placeholder="Guests"
                      value={form.head_count}
                      onChange={(e) => setField('head_count', e.target.value)}
                      className={`${inputClass} ${placeholderStyle}`}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </>
            )}

            {option === 'venue' && (
              <>
                <div>
                  <label className={labelClass} htmlFor="party-venue-date">Event date</label>
                  <input
                    id="party-venue-date"
                    required
                    type="date"
                    min={minDate}
                    value={form.event_date}
                    onChange={(e) => setField('event_date', e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="party-venue-details">Tell us about the event</label>
                  <textarea
                    id="party-venue-details"
                    rows={3}
                    placeholder="Private party, rehearsal dinner, birthday, estimated guests…"
                    value={form.details}
                    onChange={(e) => setField('details', e.target.value)}
                    className={`${inputClass} resize-y ${placeholderStyle}`}
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {option === 'table' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="party-table-date">Date</label>
                    <input
                      id="party-table-date"
                      required
                      type="date"
                      min={minDate}
                      value={form.event_date}
                      onChange={(e) => setField('event_date', e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="party-table-time">Time</label>
                    <input
                      id="party-table-time"
                      required
                      type="time"
                      value={form.event_time}
                      onChange={(e) => setField('event_time', e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="party-table-size">Party size</label>
                  <input
                    id="party-table-size"
                    required
                    type="number"
                    min={1}
                    max={20}
                    placeholder="Number of guests"
                    value={form.head_count}
                    onChange={(e) => setField('head_count', e.target.value)}
                    className={`${inputClass} ${placeholderStyle}`}
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {/* Honeypot — hidden from users */}
            <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="party-website">Website</label>
              <input
                id="party-website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium" role="alert">{error}</p>
            )}

            {!online && (
              <p className={`text-sm ${theme.textMuted}`}>
                Online requests need Supabase — for now, call{' '}
                <a href="tel:781-848-4448" className="font-bold underline">781-848-4448</a>.
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={!online}
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Sending…</>
              ) : (
                option === 'catering' ? 'Request catering' : option === 'venue' ? 'Request venue booking' : 'Request table'
              )}
            </Button>

            <p className={`flex items-center justify-center gap-1.5 text-xs ${theme.textMuted}`}>
              <Phone size={12} />
              Prefer to talk?{' '}
              <a href="tel:781-848-4448" className="font-bold underline hover:no-underline">781-848-4448</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
