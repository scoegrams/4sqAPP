import React from 'react';

type GuideMode = 'login' | 'dashboard';

interface StaffAdminGuideProps {
  mode: GuideMode;
  className?: string;
  fromSecretTap?: boolean;
}

const textClass = 'text-sm text-[#5c564d] leading-relaxed';

const StaffAdminGuide: React.FC<StaffAdminGuideProps> = ({
  mode,
  className = '',
  fromSecretTap = false,
}) => {
  if (mode === 'login') {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className={textClass}>
          {fromSecretTap
            ? 'Good — you tapped Four Square 5 times. Now type your PIN below and tap Sign in.'
            : 'To get in: go to the Menu page. At the very bottom, tap Four Square five times fast (you’ll see 1/5, 2/5…). That opens this screen.'}
        </p>
        <p className={textClass}>
          Type <span className="font-mono font-semibold text-[#2d3d2d]">48177</span> and tap Sign in. No email — PIN only. Three wrong tries, then a short lockout.
        </p>
        <p className={textClass}>
          After you’re in, tap Enable admin. Edit the menus on each page, then come back here and tap Save version so guests see your changes.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <p className={textClass}>
        Turn admin mode on. Dashed lines mean you can tap and type.
      </p>
      <p className={textClass}>
        Menu — food sections and prices. Drinks — cocktails and beer. Specials — lunch board, photos, day tags. Footer ticker — daily lunch dishes (or edit via Lunch specials in Jackpot). Marquee events — header train sign (Jackpot → Specials & events → Marquee events).
      </p>
      <p className={textClass}>
        When the top bar says unsaved, open Jackpot and tap Save version. Guests only see saved changes.
      </p>
    </div>
  );
};

export default StaffAdminGuide;
