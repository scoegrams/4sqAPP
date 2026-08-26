import React from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'muted'
  | 'danger'
  | 'dangerGhost'
  | 'dashed'
  | 'menu'
  | 'drawer'
  | 'drawerActive';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'iconSm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
}

const BASE =
  'inline-flex items-center justify-center gap-1.5 font-barDisplay font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--fs-nav-active-text)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--fs-page-bg)] disabled:cursor-not-allowed disabled:opacity-40';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'text-white border-2 border-[color:var(--fs-footer-schedule-border)] bg-[var(--fs-footer-schedule-bg)] hover:bg-[var(--fs-footer-schedule-hover-bg)] active:scale-[0.98]',
  secondary:
    'text-[color:var(--fs-page-text)] border-2 border-[color:var(--fs-border)] bg-[var(--fs-card-bg)] hover:border-[color:var(--fs-nav-active-border)] active:scale-[0.98]',
  ghost:
    'text-[color:var(--fs-text-muted)] hover:text-[color:var(--fs-page-text)] bg-transparent border-0 normal-case tracking-normal font-semibold',
  link:
    'text-[color:var(--fs-nav-active-text)] underline hover:no-underline normal-case tracking-normal font-semibold bg-transparent border-0 p-0 min-h-0',
  muted:
    'text-[color:var(--fs-btn-muted)] hover:text-[color:var(--fs-btn-muted-hover)] bg-transparent border-0',
  danger:
    'text-red-700 border-2 border-red-200 bg-transparent hover:bg-red-50 active:scale-[0.98]',
  dangerGhost:
    'text-red-500/50 hover:text-red-400 bg-transparent border-0 p-0 min-h-0',
  dashed:
    'w-full text-[color:var(--fs-btn-muted)] hover:text-[color:var(--fs-btn-muted-hover)] border border-dashed border-[color:var(--fs-input-border)] hover:border-[color:var(--fs-text-muted)] bg-transparent active:scale-[0.98]',
  menu:
    'bg-[var(--fs-header-menu-btn-bg)] border-2 border-[color:var(--fs-header-menu-btn-border)] text-[color:var(--fs-header-menu-btn-icon)] active:scale-95',
  drawer:
    'w-full justify-start gap-3 px-4 min-h-[48px] py-3 text-sm tracking-widest border-0 rounded-none text-[color:var(--fs-drawer-inactive-text)] hover:bg-[color:var(--fs-drawer-hover-bg)] active:scale-[0.99]',
  drawerActive:
    'w-full justify-start gap-3 px-4 min-h-[48px] py-3 text-sm tracking-widest border-0 rounded-none text-[color:var(--fs-drawer-active-text)] bg-[color:var(--fs-drawer-active-bg)] active:scale-[0.99]',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'text-[9px] px-2 py-1 tracking-widest min-h-[28px]',
  sm: 'text-[10px] px-2.5 py-1 tracking-wider min-h-[32px]',
  md: 'text-[11px] px-4 py-2.5 tracking-widest min-h-[40px]',
  lg: 'text-[11px] px-4 py-2.5 tracking-widest min-h-[44px]',
  icon: 'min-h-[44px] min-w-[44px] p-2 shrink-0',
  iconSm: 'p-1.5 shrink-0',
};

const ROUNDED_VARIANTS = new Set<ButtonVariant>([
  'primary',
  'secondary',
  'ghost',
  'danger',
  'dashed',
  'menu',
  'muted',
]);

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    iconOnly = false,
    className,
    disabled,
    style,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const resolvedSize = iconOnly && size === 'md' ? 'icon' : size;
  const rounded = ROUNDED_VARIANTS.has(variant);

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={joinClasses(
        BASE,
        VARIANTS[variant],
        SIZES[resolvedSize],
        fullWidth && 'w-full',
        className,
      )}
      style={{
        ...(rounded ? { borderRadius: 'var(--fs-radius)' } : undefined),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
