import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Theme } from '../../theme';

interface BookingPageProps {
  theme: Theme;
}

const BookingPage: React.FC<BookingPageProps> = ({ theme }) => {
  const isMbta = theme.mode === 'mbta';
  const accent = isMbta ? 'text-[#00843D]' : theme.isDark ? 'text-emerald-400' : 'text-emerald-700';
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h2 className={`text-2xl font-black uppercase tracking-[0.15em] mb-6 ${accent}`}>
        Book a Table
      </h2>
      {submitted ? (
        <div className={`text-center p-8 border-2 ${theme.isDark ? 'bg-slate-800/60 border-slate-700' : isMbta ? 'bg-white/5 border-white/15' : 'bg-white border-slate-200'}`}>
          <CalendarDays size={32} className={`mx-auto mb-3 ${accent}`} />
          <p className={`text-sm font-bold ${theme.text}`}>Reservation request sent!</p>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>We'll confirm via email shortly.</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          className={`p-6 border-2 space-y-4 ${theme.isDark ? 'bg-slate-800/60 border-slate-700' : isMbta ? 'bg-white/5 border-white/15' : 'bg-white border-slate-200'}`}
        >
          {['Name', 'Email', 'Phone'].map((label) => (
            <div key={label}>
              <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${theme.textMuted}`}>{label}</label>
              <input
                required
                type={label === 'Email' ? 'email' : 'text'}
                className={`w-full px-3 py-2 text-sm border ${theme.inputBg} ${theme.inputBorder} ${theme.text} focus:outline-none`}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${theme.textMuted}`}>Date</label>
              <input required type="date" className={`w-full px-3 py-2 text-sm border ${theme.inputBg} ${theme.inputBorder} ${theme.text} focus:outline-none`} />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${theme.textMuted}`}>Guests</label>
              <select className={`w-full px-3 py-2 text-sm border ${theme.inputBg} ${theme.inputBorder} ${theme.text} focus:outline-none`}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-2.5 text-xs font-black uppercase tracking-[0.2em] transition-all ${
              isMbta ? 'bg-[#DA291C] text-white' : theme.isDark ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Reserve
          </button>
        </form>
      )}
    </div>
  );
};

export default BookingPage;
