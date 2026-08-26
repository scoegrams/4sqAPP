/**
 * Soft-launch toggles. Set `VITE_ENABLE_CONNECT4=true` in `.env` to ship social / online play.
 */
export const FEATURES = {
  connect4: import.meta.env.VITE_ENABLE_CONNECT4 === 'true',
} as const;
