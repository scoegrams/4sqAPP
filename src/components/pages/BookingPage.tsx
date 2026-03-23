import React, { useState } from 'react';
import { Theme } from '../../theme';

interface BookingPageProps {
  theme: Theme;
}

type PartyOption = 'catering' | 'venue' | 'table';

const BookingPage: React.FC<BookingPageProps> = ({ theme }) => {
  const [option, setOption] = useState<PartyOption>('table');
  const [submitted, setSubmitted] = useState(false);

  // All accent/primary colors come from design tokens
  const btnActiveStyle: React.CSSProperties = {
    backgroundColor: 'var(--fs-footer-schedule-bg)',
    color: 'white',
    borderColor: 'var(--fs-footer-schedule-bg)',
    borderRadius: 'var(--fs-radius)',
  };
  const btnInactiveStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'var(--fs-text-muted)',
    borderColor: 'var(--fs-border)',
    borderRadius: 'var(--fs-radius)',
  };
  const btnSolidStyle: React.CSSProperties = {
    backgroundColor: 'var(--fs-footer-schedule-bg)',
    color: 'white',
    borderRadius: 'var(--fs-radius)',
  };
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--fs-input-bg)',
    borderColor: 'var(--fs-input-border)',
    color: 'var(--fs-page-text)',
    borderRadius: 'var(--fs-radius)',
  };

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${theme.textMuted}`;
  const inputClass = `w-full px-4 py-3 text-base focus:outline-none focus:ring-1 border`;
  const placeholderStyle = theme.isDark ? 'placeholder:text-[#6b6560]' : 'placeholder:text-[#8a8580]';

  const options: { id: PartyOption; label: string }[] = [
    { id: 'catering', label: 'Catering' },
    { id: 'venue', label: 'Book the venue' },
    { id: 'table', label: 'Reserve a table' },
  ];

  return (
    <div
      className="font-bar min-h-[60vh] py-10 sm:py-14"
      style={{ backgroundColor: 'var(--fs-page-bg)' }}
    >
      <div className="max-w-xl mx-auto px-5 sm:px-8">
        <h2
          className="font-barDisplay text-2xl sm:text-3xl font-bold mb-8"
          style={{ color: 'var(--fs-page-text)' }}
        >
          Your party.
        </h2>

        {/* 3 option tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {options.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setOption(id)}
              className="px-4 py-2.5 text-sm font-semibold uppercase tracking-wider border-2 transition-colors hover:opacity-80"
              style={option === id ? btnActiveStyle : btnInactiveStyle}
            >
              {label}
            </button>
          ))}
        </div>

        {submitted ? (
          <div
            className="py-10 px-6 text-center border"
            style={{ borderColor: 'var(--fs-border)' }}
          >
            <p className={`font-semibold text-lg ${theme.text}`}>We got it.</p>
            <p className={`text-sm mt-1 ${theme.textMuted}`}>We'll be in touch soon to confirm.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="space-y-4"
          >
            <div>
              <label className={labelClass}>Name</label>
              <input required type="text" className={`${inputClass} ${placeholderStyle}`} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input required type="email" className={`${inputClass} ${placeholderStyle}`} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input required type="tel" className={`${inputClass} ${placeholderStyle}`} style={inputStyle} />
            </div>

            {option === 'catering' && (
              <>
                <div>
                  <label className={labelClass}>What do you want?</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Menu ideas, dietary needs, anything we should know…"
                    className={`${inputClass} resize-y ${placeholderStyle}`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass}>When to feed</label>
                  <input required type="date" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass}>How many to feed</label>
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Head count"
                    className={`${inputClass} ${placeholderStyle}`}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={btnSolidStyle}
                >
                  Request catering
                </button>
              </>
            )}

            {option === 'venue' && (
              <>
                <div>
                  <label className={labelClass}>Pick date</label>
                  <input required type="date" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass}>Tell us about the event</label>
                  <textarea
                    rows={3}
                    placeholder="Private party, rehearsal dinner, etc."
                    className={`${inputClass} resize-y ${placeholderStyle}`}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={btnSolidStyle}
                >
                  Book the venue
                </button>
              </>
            )}

            {option === 'table' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date</label>
                    <input required type="date" className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className={labelClass}>Time</label>
                    <input required type="time" className={inputClass} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Party size</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={20}
                    placeholder="Number of guests"
                    className={`${inputClass} ${placeholderStyle}`}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={btnSolidStyle}
                >
                  Reserve table
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
