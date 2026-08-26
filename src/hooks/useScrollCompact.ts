import { useEffect, useState, type RefObject } from 'react';

export function useScrollCompact(
  scrollRef: RefObject<HTMLElement | null>,
  threshold = 16,
): boolean {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => setCompact(el.scrollTop > threshold);
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef, threshold]);

  return compact;
}
