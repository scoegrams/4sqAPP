import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageCircle, Trophy, Gift, Mail, Phone, Send, User, LogOut } from 'lucide-react';
import { Theme } from '../../theme';
import { hasSupabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Connect4Score, ChatMessage as ChatMessageType } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

interface Connect4PageProps {
  theme: Theme;
}

type Cell = null | 'red' | 'yellow';
const ROWS = 6;
const COLS = 7;

const createBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function checkWin(board: Cell[][], player: Cell): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) break;
          count++;
        }
        if (count >= 4) return true;
      }
    }
  }
  return false;
}

function getLowestEmptyRow(board: Cell[][], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return -1;
}

// ── Themed style helpers using design tokens ──────────────────────────────────

const accentText = 'text-[color:var(--fs-nav-active-text)]';
const accentBgStyle = { backgroundColor: 'var(--fs-footer-schedule-bg)', color: 'white', borderRadius: 'var(--fs-radius)' } as React.CSSProperties;
const accentBorderStyle = { borderColor: 'var(--fs-footer-schedule-bg)', color: 'var(--fs-nav-active-text)', borderRadius: 'var(--fs-radius)' } as React.CSSProperties;
const cardStyle = { backgroundColor: 'var(--fs-card-bg)', borderColor: 'var(--fs-border)', borderRadius: 'var(--fs-radius)', boxShadow: 'var(--fs-card-shadow)' } as React.CSSProperties;
const inputStyle = { backgroundColor: 'var(--fs-input-bg)', borderColor: 'var(--fs-input-border)', borderRadius: 'var(--fs-radius)' } as React.CSSProperties;
const dividerStyle = { borderColor: 'var(--fs-divider-muted)' } as React.CSSProperties;

// ─────────────────────────────────────────────────────────────────────────────

const Connect4Page: React.FC<Connect4PageProps> = ({ theme }) => {
  const auth = useAuth();
  const { user, profile, loading: authLoading, error: authError, signInWithEmail, signInWithPhone, verifyPhoneOtp, signOut, updateProfile, clearError } = auth;

  // Game
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [turn, setTurn] = useState<'red' | 'yellow'>('red');
  const [winner, setWinner] = useState<Cell>(null);
  const [leftName, setLeftName] = useState('Player 1');
  const [rightName, setRightName] = useState('Player 2');

  // Auth form
  const [authTab, setAuthTab] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneSent, setPhoneSent] = useState(false);
  const [authSuccess, setAuthSuccess] = useState('');

  // Handle setup
  const [handleInput, setHandleInput] = useState('');
  const [settingHandle, setSettingHandle] = useState(false);

  // Social
  const [highScores, setHighScores] = useState<Connect4Score[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [rewardsJoined, setRewardsJoined] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isSocial = hasSupabase();
  const isLoggedIn = !!user && !!profile;
  const isRanked = isSocial && isLoggedIn;
  const needsHandle = isLoggedIn && !profile?.display_name;

  // Set left name from profile on login
  useEffect(() => {
    if (isLoggedIn && profile?.display_name) {
      setLeftName(profile.display_name);
    }
  }, [isLoggedIn, profile?.display_name]);

  // High scores (reload on win)
  useEffect(() => {
    if (!supabase || !isSocial) return;
    supabase
      .from('connect4_scores')
      .select('*')
      .order('wins', { ascending: false })
      .limit(8)
      .then(({ data }) => setHighScores((data as Connect4Score[]) || []));
  }, [isSocial, winner]);

  // Chat load + realtime
  useEffect(() => {
    if (!supabase || !isSocial) return;
    supabase
      .from('connect4_chat')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => setChatMessages((data as ChatMessageType[]) || []));

    const channel = supabase
      .channel('connect4_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connect4_chat' }, (payload) => {
        setChatMessages((prev) => [...prev, payload.new as ChatMessageType]);
      })
      .subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, [isSocial]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const drop = useCallback((col: number) => {
    if (winner) return;
    const row = getLowestEmptyRow(board, col);
    if (row < 0) return;
    const nextBoard = board.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? turn : c)) : [...r]
    );
    setBoard(nextBoard);
    if (checkWin(nextBoard, turn)) {
      setWinner(turn);
      if (isRanked && supabase && user && profile && turn === 'red') {
        const name = profile.display_name || profile.email || 'Player';
        supabase.from('connect4_scores').select('wins').eq('user_id', user.id).single().then(({ data }) => {
          const wins = (data?.wins ?? 0) + 1;
          supabase!.from('connect4_scores').upsert(
            { user_id: user.id, display_name: name, wins, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          );
        });
      }
    } else {
      setTurn((t) => (t === 'red' ? 'yellow' : 'red'));
    }
  }, [board, turn, winner, isRanked, user, profile]);

  const reset = useCallback(() => {
    setBoard(createBoard());
    setTurn('red');
    setWinner(null);
  }, []);

  const sendChat = useCallback(() => {
    const msg = chatInput.trim();
    if (!msg || !supabase || !user || !profile) return;
    supabase.from('connect4_chat').insert({
      user_id: user.id,
      display_name: profile.display_name || profile.email || 'Guest',
      message: msg,
    });
    setChatInput('');
  }, [chatInput, user, profile]);

  const saveHandle = async () => {
    if (!handleInput.trim()) return;
    const handle = handleInput.startsWith('@') ? handleInput : `@${handleInput.trim()}`;
    setSettingHandle(true);
    await updateProfile({ display_name: handle });
    setLeftName(handle);
    setSettingHandle(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setAuthSuccess('');
    const { error } = await signInWithEmail(emailInput);
    if (!error) setAuthSuccess('Check your email for the login link.');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setAuthSuccess('');
    if (!phoneSent) {
      const { error } = await signInWithPhone(phoneInput);
      if (!error) { setPhoneSent(true); setAuthSuccess('Enter the code we texted you.'); }
    } else {
      const { error } = await verifyPhoneOtp(phoneInput, phoneOtp);
      if (!error) setAuthSuccess("You're in!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`text-2xl font-barDisplay font-bold uppercase tracking-[0.1em] ${accentText}`}>Connect 4</h2>
          <p className={`text-[10px] uppercase tracking-widest mt-0.5 font-bold ${isRanked ? accentText : theme.textMuted}`}>
            {isRanked ? '★ Ranked — wins count' : isSocial ? 'Sign in to play ranked' : 'Local play'}
          </p>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${theme.text}`}>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-barDisplay font-bold text-white shrink-0"
                style={accentBgStyle}
              >
                {(profile?.display_name || profile?.email || 'P')[0].toUpperCase()}
              </div>
              {profile?.display_name || profile?.email}
            </div>
            <button onClick={() => signOut?.()} className={`text-[9px] uppercase tracking-wider ${theme.textMuted} hover:underline flex items-center gap-1`}>
              <LogOut size={9} /> Sign out
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left: Game board ── */}
        <div className="border-2 p-4 sm:p-5" style={cardStyle}>
          {/* Player names */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={leftName}
              onChange={e => setLeftName(e.target.value)}
              placeholder="Red player"
              className={`flex-1 px-3 py-1.5 text-xs font-bold text-center border-2 bg-transparent transition-colors ${
                turn === 'red' && !winner
                  ? 'border-red-500 text-red-500'
                  : theme.isDark ? 'border-red-500/30 text-red-400/70' : 'border-red-400/30 text-red-500/70'
              }`}
            />
            <span className={`text-[10px] font-barDisplay font-bold uppercase shrink-0 ${theme.textMuted}`}>vs</span>
            <input
              type="text"
              value={rightName}
              onChange={e => setRightName(e.target.value)}
              placeholder="Yellow player"
              className={`flex-1 px-3 py-1.5 text-xs font-bold text-center border-2 bg-transparent transition-colors ${
                turn === 'yellow' && !winner
                  ? 'border-yellow-500 text-yellow-500'
                  : theme.isDark ? 'border-yellow-500/30 text-yellow-400/70' : 'border-yellow-400/30 text-yellow-500/70'
              }`}
            />
          </div>

          {/* Board — game-specific blue frame is intentional */}
          <div className="flex justify-center">
            <div
              className="inline-grid gap-1.5 p-3 border-2"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                backgroundColor: 'var(--fs-quad-blue-accent)',
                borderColor: 'var(--fs-quad-blue-border)',
              }}
            >
              {board.flat().map((cell, i) => {
                const col = i % COLS;
                return (
                  <button
                    key={i}
                    onClick={() => drop(col)}
                    disabled={!!winner}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all duration-150 active:scale-90 disabled:cursor-default ${
                      cell === 'red'
                        ? 'bg-red-500 border-red-300 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3)]'
                        : cell === 'yellow'
                        ? 'bg-yellow-400 border-yellow-200 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2)]'
                        : theme.isDark
                        ? 'bg-slate-800/70 border-white/10 hover:bg-slate-700/80'
                        : 'bg-white/30 border-white/40 hover:bg-white/50'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 text-center space-y-2.5">
            {winner ? (
              <div>
                <p className={`text-lg font-barDisplay font-bold uppercase ${winner === 'red' ? 'text-red-500' : 'text-yellow-400'}`}>
                  {winner === 'red' ? leftName : rightName} wins!
                </p>
                {isRanked && winner === 'red' && (
                  <p className={`text-[10px] mt-0.5 ${accentText}`}>★ Ranked win recorded</p>
                )}
              </div>
            ) : (
              <p className={`text-sm ${theme.textMuted}`}>
                <span className={`font-barDisplay font-bold ${turn === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {turn === 'red' ? leftName : rightName}
                </span>
                {' '}to move
              </p>
            )}
            <button
              onClick={reset}
              className="px-6 py-2 text-[10px] font-barDisplay font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={accentBgStyle}
            >
              New game
            </button>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Sign-in CTA */}
          {isSocial && !isLoggedIn && !authLoading && (
            <div className="border-2 p-4" style={cardStyle}>
              <p className={`text-sm font-barDisplay font-bold uppercase tracking-tight mb-0.5 ${theme.text}`}>
                Play here or play ranked
              </p>
              <p className={`text-[11px] mb-4 leading-relaxed ${theme.textMuted}`}>
                Join Four Square — chat with players, track your wins, and be #1 on the leaderboard.
              </p>

              <div className="flex gap-1.5 mb-3">
                {(['email', 'phone'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAuthTab(tab)}
                    className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 transition-all"
                    style={authTab === tab ? accentBgStyle : { borderColor: 'var(--fs-input-border)', color: 'var(--fs-text-muted)' }}
                  >
                    {tab === 'email' ? <><Mail size={10} className="inline mr-1" />Email</> : <><Phone size={10} className="inline mr-1" />Phone</>}
                  </button>
                ))}
              </div>

              {authTab === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className={`w-full px-3 py-2 border text-xs ${theme.text}`}
                    style={inputStyle}
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 text-[10px] font-barDisplay font-bold uppercase tracking-widest"
                    style={accentBgStyle}
                  >
                    Send magic link
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePhoneSubmit} className="space-y-2">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-3 py-2 border text-xs ${theme.text}`}
                    style={inputStyle}
                  />
                  {phoneSent && (
                    <input
                      type="text"
                      value={phoneOtp}
                      onChange={e => setPhoneOtp(e.target.value)}
                      placeholder="6-digit code"
                      maxLength={6}
                      className={`w-full px-3 py-2 border text-xs ${theme.text}`}
                      style={inputStyle}
                    />
                  )}
                  <button
                    type="submit"
                    className="w-full py-2.5 text-[10px] font-barDisplay font-bold uppercase tracking-widest"
                    style={accentBgStyle}
                  >
                    {phoneSent ? 'Verify code' : 'Send code'}
                  </button>
                </form>
              )}

              {authSuccess && <p className={`mt-2.5 text-xs ${accentText}`}>{authSuccess}</p>}
              {authError && <p className="mt-2.5 text-xs text-red-400">{authError}</p>}
            </div>
          )}

          {/* @handle setup */}
          {isSocial && needsHandle && (
            <div className="border-2 p-4" style={cardStyle}>
              <div className="flex items-center gap-2 mb-1">
                <User size={13} className={accentText} />
                <p className={`text-xs font-barDisplay font-bold uppercase tracking-wider ${theme.text}`}>Choose your @handle</p>
              </div>
              <p className={`text-[10px] mb-3 ${theme.textMuted}`}>
                This is how you'll appear on the leaderboard and in chat.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.textMuted}`}>@</span>
                  <input
                    type="text"
                    value={handleInput}
                    onChange={e => setHandleInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="yourcoolname"
                    className={`w-full pl-6 pr-3 py-2 border text-xs ${theme.text}`}
                    style={inputStyle}
                    onKeyDown={e => e.key === 'Enter' && saveHandle()}
                  />
                </div>
                <button
                  type="button"
                  onClick={saveHandle}
                  disabled={settingHandle || !handleInput.trim()}
                  className="px-3 py-2 text-[10px] font-barDisplay font-bold uppercase disabled:opacity-40 transition-opacity"
                  style={accentBgStyle}
                >
                  Set
                </button>
              </div>
            </div>
          )}

          {/* Logged-in user card */}
          {isSocial && isLoggedIn && !needsHandle && (
            <div className="border-2 p-3" style={cardStyle}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-barDisplay font-bold text-white shrink-0"
                  style={accentBgStyle}
                >
                  {(profile?.display_name || profile?.email || 'P')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${theme.text}`}>{profile?.display_name || profile?.email}</p>
                  <p className={`text-[9px] ${accentText}`}>★ Playing ranked</p>
                </div>
              </div>
              {!profile?.rewards_opted_in && !rewardsJoined ? (
                <button
                  type="button"
                  onClick={() => { updateProfile({ rewards_opted_in: true }); setRewardsJoined(true); }}
                  className="w-full py-2 text-[9px] font-barDisplay font-bold uppercase tracking-wider border-2 flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
                  style={accentBorderStyle}
                >
                  <Gift size={10} /> Join Four Square Rewards
                </button>
              ) : (
                <p className={`text-[9px] text-center ${accentText}`}>✓ Rewards member</p>
              )}
            </div>
          )}

          {/* Leaderboard */}
          {isSocial && (
            <div className="border-2 overflow-hidden" style={cardStyle}>
              <div className="px-3 py-2.5 border-b flex items-center gap-2" style={dividerStyle}>
                <Trophy size={13} className={accentText} />
                <span className={`text-[10px] font-barDisplay font-bold uppercase tracking-wider ${theme.text}`}>Leaderboard</span>
                {!isLoggedIn && (
                  <span className={`ml-auto text-[9px] italic ${theme.textMuted}`}>Sign in to compete</span>
                )}
              </div>
              {highScores.length > 0 ? (
                <ul>
                  {highScores.map((s, i) => {
                    const isMe = profile?.display_name === s.display_name;
                    return (
                      <li
                        key={s.id}
                        className="flex items-center justify-between px-3 py-2 text-xs border-b last:border-0"
                        style={{
                          borderColor: 'var(--fs-divider-muted)',
                          ...(isMe ? { backgroundColor: 'var(--fs-quad-green-bg)' } : {}),
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 shrink-0 text-[9px] font-barDisplay font-bold ${
                            i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : theme.textMuted
                          }`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                          </span>
                          <span className={isMe ? `font-bold ${accentText}` : theme.text}>{s.display_name}</span>
                        </div>
                        <span
                          className="font-barDisplay font-bold tabular-nums"
                          style={isMe ? { color: 'var(--fs-nav-active-text)' } : { color: 'var(--fs-text-muted)' }}
                        >
                          {s.wins}W
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={`px-3 py-5 text-xs text-center ${theme.textMuted}`}>
                  No ranked games yet —<br />be first!
                </p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Chat — full width at bottom ── */}
      {isSocial && (
        <div className="mt-5 border-2 overflow-hidden" style={cardStyle}>
          <div className="px-3 py-2.5 border-b flex items-center gap-2" style={dividerStyle}>
            <MessageCircle size={13} className={accentText} />
            <span className={`text-[10px] font-barDisplay font-bold uppercase tracking-wider ${theme.text}`}>Chat</span>
            {!isLoggedIn && (
              <span className={`ml-auto text-[9px] italic ${theme.textMuted}`}>Sign in to send messages</span>
            )}
          </div>
          <div className="h-32 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">
            {chatMessages.length === 0 && (
              <p className={`text-[10px] text-center py-6 ${theme.textMuted}`}>No messages yet — say hi!</p>
            )}
            {chatMessages.map((m) => (
              <div key={m.id} className="text-[11px] leading-snug">
                <span className={`font-bold ${accentText}`}>{m.display_name}</span>
                <span className={`ml-1.5 ${theme.textMuted}`}>{m.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {isLoggedIn ? (
            <div className="flex gap-2 p-2.5 border-t" style={dividerStyle}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder={`Message as ${profile?.display_name || 'you'}…`}
                className={`flex-1 min-w-0 px-3 py-2 text-xs border ${theme.text}`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={sendChat}
                className="p-2"
                style={accentBgStyle}
                aria-label="Send"
              >
                <Send size={13} />
              </button>
            </div>
          ) : (
            <div className="px-3 py-2.5 border-t text-center" style={dividerStyle}>
              <p className={`text-[10px] ${theme.textMuted}`}>Sign in above to chat with other players</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Connect4Page;
