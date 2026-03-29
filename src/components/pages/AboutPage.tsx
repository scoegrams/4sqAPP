import React from 'react';
import { Theme } from '../../theme';
import type { Page } from '../NavDrawer';

export interface AboutPageProps {
  theme: Theme;
  onNavigate?: (page: Page) => void;
}

const ABOUT_HERO_IMAGE = 'https://t4.ftcdn.net/jpg/01/36/55/99/360_F_136559916_gXcqY2ROcjVLh19AQrZ9WTmRZb1rNK7t.jpg';

/** Opens the place in Google Maps (map + directions + reviews on the listing). */
const GOOGLE_MAPS_PLACE_URL = 'https://share.google/BNmWveS6rJw5QsVKo';

const MAP_SCREENSHOT = '/images/4square-map.png';

const AboutPage: React.FC<AboutPageProps> = ({ theme, onNavigate }) => {
  const isDark = theme.isDark || theme.mode === 'apple';
  const bgWarm = isDark ? 'bg-[#1a1918]' : 'bg-[#F4F1EA]';
  const textPrimary = isDark ? 'text-[#f4f1ea]' : 'text-[#1a1a1a]';
  const textMuted = isDark ? 'text-[#c4beb5]' : 'text-[#5c564d]';
  const headingColor = isDark ? 'text-[#e8e4dc]' : 'text-[#2d3d2d]';

  return (
    <div className="font-bar">
      {/* Hero — full width, image + overlay, left-aligned text */}
      <section className="relative w-full min-h-[50vh] sm:min-h-[60vh] flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${ABOUT_HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 px-5 sm:px-8 md:px-12 lg:px-16 pb-12 sm:pb-16 pt-24 max-w-4xl">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#c9b896] mb-2">
            Woman-owned since 2019
          </p>
          <h1 className="font-barDisplay text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#e8e4dc]">
            A neighborhood bar done right.
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium text-[#c9b896] tracking-wide">
            Weymouth Landing · Braintree
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigate?.('menu')}
              className="inline-block px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#c9b896] text-[#1a1918] hover:bg-[#d4c4a4] transition-colors"
            >
              View Menu
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('booking')}
              className="inline-block px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-2 border-[#c9b896] text-[#e8e4dc] hover:bg-[#c9b896]/10 transition-colors"
            >
              See Events
            </button>
          </div>
        </div>
      </section>

      {/* About copy + map — two columns on large screens */}
      <section className={`${bgWarm} py-12 sm:py-16`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <h2 className={`font-barDisplay text-2xl sm:text-3xl font-bold mb-6 ${headingColor}`}>
                Four Square
              </h2>
              <div className={`space-y-4 text-base sm:text-lg leading-relaxed ${textPrimary}`}>
                <p>
                  We're a woman-owned bar in Weymouth Landing serving strong pours, real food, and the kind of nights people actually remember.
                </p>
                <p>
                  We clean our beer lines like it matters.<br />
                  We change our fry oil weekly.<br />
                  We make our food fresh.
                </p>
                <p>
                  Karaoke. Game nights. Steak tips. Bar pizza.<br />
                  Come in once — and you'll get it.
                </p>
              </div>
            </div>

            <div className="w-full lg:sticky lg:top-6">
              <a
                href={GOOGLE_MAPS_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block overflow-hidden rounded-lg shadow-md transition-all duration-200 ring-offset-2 ring-offset-[#F4F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d3d2d] ${
                  isDark ? 'ring-offset-[#1a1918] focus-visible:ring-[#c9b896]' : ''
                } ${isDark ? 'border border-white/10' : 'border border-[#2d3d2d]/15'}`}
              >
                <img
                  src={MAP_SCREENSHOT}
                  alt="Map showing Four Square Restaurant &amp; Bar at Weymouth Landing"
                  className="w-full h-auto object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <p className={`mt-2 text-sm ${textMuted}`}>
                <span className={isDark ? 'text-[#c9b896]/80' : 'text-[#2d3d2d]/80'}>
                  Tap map for directions &amp; Google listing (reviews, hours){' '}
                </span>
                <span className={`font-semibold ${isDark ? 'text-[#c9b896]' : 'text-[#2d3d2d]'}`}>Google Maps</span>
                <span className="block mt-0.5 text-xs">16 Commercial Street, Weymouth Landing</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Find Us — typographic only, two-column desktop, no icons */}
      <section className={`${bgWarm} border-t ${isDark ? 'border-white/10' : 'border-[#2d3d2d]/15'} py-12 sm:py-14`}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <h2 className={`font-barDisplay text-xl sm:text-2xl font-bold mb-8 ${headingColor}`}>
            Find Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className={`font-semibold text-base sm:text-lg leading-snug ${textPrimary}`}>
                16 Commercial Street<br />
                Weymouth Landing<br />
                Braintree, MA
              </p>
            </div>
            <div>
              <p className={`font-semibold text-base sm:text-lg leading-snug ${textPrimary}`}>
                Open Wednesday–Saturday
              </p>
              <p className={`mt-2 text-base ${textPrimary}`}>
                <a href="tel:781-848-4448" className="hover:underline">781-848-4448</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
