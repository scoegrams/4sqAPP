/** Patriots-inspired day pills: navy (#002244), red (#C60C30), silver-gray accent. */
export const DAY_TAG_CLASSES: Record<string, string> = {
  Mon: 'bg-[#002244]',
  Tue: 'bg-[#C60C30]',
  Wed: 'bg-[#003875]',
  Thu: 'bg-[#C60C30]',
  Fri: 'bg-[#001528]',
  Sat: 'bg-[#C60C30]',
  Sun: 'bg-[#5c6670]',
};

export const DAY_TAG_FALLBACK = 'bg-[#002244]';

export function dayTagClass(day: string): string {
  return DAY_TAG_CLASSES[day] ?? DAY_TAG_FALLBACK;
}
