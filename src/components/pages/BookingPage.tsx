import React, { useState } from 'react';
import { Theme } from '../../theme';

interface BookingPageProps {
  theme: Theme;
}

type PartyOption = 'catering' | 'venue' | 'table';

const BookingPage: React.FC<BookingPageProps> = ({ theme }) => {
  const [option, setOption] = useState<PartyOption>('table');
  const [submitted, setSubmitted] = useState(false);
  const isDark = theme.isDark || theme.mode === 'apple';
  const bgWarm = isDark ? 'bg-[#1a1918]' : 'bg-[#F4F1EA]';
  const textPrimary = isDark ? 'text-[#e8e4dc]' : 'text-[#1a1a1a]';
  const textMuted = isDark ? 'text-[#c4beb5]' : 'text-[#5c564d]';
  const headingColor = isDark ? 'text-[#e8e4dc]' : 'text-[#2d3d2d]';
  const inputBg = isDark ? 'bg-[#2a2826] border-[#4a4540]' : 'bg-white border-[#c4beb5]';
  const btnSolid = 'bg-[#2d3d2d] text-[#F4F1EA] hover:bg-[#3d4d3d] transition-colors';
  const focusRing = isDark ? 'focus:ring-[#c9b896]' : 'focus:ring-[#2d3d2d]';
  const placeholderClass = isDark ? 'placeholder:text-[#6b6560]' : 'placeholder:text-[#8a8580]';

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${textMuted}`;
  const inputClass = `w-full px-4 py-3 text-base ${inputBg} ${textPrimary} focus:outline-none focus:ring-1 ${focusRing}`;

  const options: { id: PartyOption; label: string }[] = [
    { id: 'catering', label: 'Catering' },
    { id: 'venue', label: 'Book the venue' },
    { id: 'table', label: 'Reserve a table' },
  ];

  return (
    <div className={`font-bar min-h-[60vh] ${bgWarm} py-10 sm:py-14`}>
      <div className="max-w-xl mx-auto px-5 sm:px-8">
        <h2 className={`font-barDisplay text-2xl sm:text-3xl font-bold mb-8 ${headingColor}`}>
          Your party.
        </h2>

        {/* 3 options */}
        <div className="flex flex-wrap gap-2 mb-8">
          {options.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setOption(id)}
              className={`px-4 py-2.5 text-sm font-semibold uppercase tracking-wider border transition-colors ${
                option === id
                  ? 'bg-[#2d3d2d] text-[#F4F1EA] border-[#2d3d2d]'
                  : isDark
                  ? 'border-[#4a4540] text-[#c4beb5] hover:border-[#c9b896] hover:text-[#e8e4dc]'
                  : 'border-[#c4beb5] text-[#5c564d] hover:border-[#2d3d2d] hover:text-[#1a1a1a]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {submitted ? (
          <div className={`py-10 px-6 text-center border ${isDark ? 'border-white/15' : 'border-[#2d3d2d]/2'}`}>
            <p className={`font-semibold text-lg ${textPrimary}`}>We got it.</p>
            <p className={`text-sm mt-1 ${textMuted}`}>We'll be in touch soon to confirm.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="space-y-4"
          >
            <div>
              <label className={labelClass}>Name</label>
              <input required type="text" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input required type="email" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input required type="tel" className={inputClass} />
            </div>

            {option === 'catering' && (
              <>
                <div>
                  <label className={labelClass}>What do you want?</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Menu ideas, dietary needs, anything we should know…"
                    className={`${inputClass} resize-y ${placeholderClass}`}
                  />
                </div>
                <div>
                  <label className={labelClass}>When to feed</label>
                  <input required type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>How many to feed</label>
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Head count"
                    className={`${inputClass} ${placeholderClass}`}
                  />
                </div>
                <button type="submit" className={`w-full py-4 text-sm font-bold uppercase tracking-widest ${btnSolid}`}>
                  Request catering
                </button>
              </>
            )}

            {option === 'venue' && (
              <>
                <div>
                  <label className={labelClass}>Pick date</label>
                  <input required type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Tell us about the event</label>
                  <textarea
                    rows={3}
                    placeholder="Private party, rehearsal dinner, etc."
                    className={`${inputClass} resize-y ${placeholderClass}`}
                  />
                </div>
                <button type="submit" className={`w-full py-4 text-sm font-bold uppercase tracking-widest ${btnSolid}`}>
                  Book the venue
                </button>
              </>
            )}

            {option === 'table' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date</label>
                    <input required type="date" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Time</label>
                    <input required type="time" className={inputClass} />
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
                    className={`${inputClass} ${placeholderClass}`}
                  />
                </div>
                <button type="submit" className={`w-full py-4 text-sm font-bold uppercase tracking-widest ${btnSolid}`}>
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
