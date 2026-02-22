import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import { Theme } from '../../theme';

interface AboutPageProps {
  theme: Theme;
}

const AboutPage: React.FC<AboutPageProps> = ({ theme }) => {
  const isMbta = theme.mode === 'mbta';
  const accent = isMbta ? 'text-[#00843D]' : theme.isDark ? 'text-emerald-400' : 'text-emerald-700';

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h2 className={`text-2xl font-black uppercase tracking-[0.15em] mb-6 ${accent}`}>
        About Four Square
      </h2>
      <p className={`text-sm leading-relaxed mb-8 ${theme.textMuted}`}>
        Four Square is a neighborhood restaurant and bar in the heart of Greenbush. We serve
        scratch-made food, craft cocktails, and local drafts in a space that feels like home.
        Whether you're here for a quick bite, game night, or a special occasion — pull up a seat.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: MapPin, title: 'Location', lines: ['123 Greenbush Ave', 'Madison, WI 53715'] },
          { icon: Clock, title: 'Hours', lines: ['Mon–Thu: 11am–10pm', 'Fri–Sat: 11am–12am', 'Sun: 10am–9pm'] },
          { icon: Phone, title: 'Contact', lines: ['(608) 555-4SQR', 'hello@foursquare.bar'] },
        ].map(({ icon: Icon, title, lines }) => (
          <div
            key={title}
            className={`p-5 border-2 ${theme.isDark ? 'bg-slate-800/60 border-slate-700' : isMbta ? 'bg-white/5 border-white/15' : 'bg-white border-slate-200'}`}
          >
            <Icon size={18} className={`mb-2 ${accent}`} />
            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${theme.text}`}>{title}</h3>
            {lines.map((l) => (
              <p key={l} className={`text-xs leading-relaxed ${theme.textMuted}`}>{l}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
