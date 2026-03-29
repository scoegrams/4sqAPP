import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  MessageCircle, Trophy, Gift, Mail, Send, User, LogOut,
  Plus, Wifi, Copy, Check, ArrowLeft, RefreshCw, Eye, Clock, AlertCircle, Trash2,
} from 'lucide-react';
import { Theme } from '../../theme';
import { hasSupabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Connect4Score, ChatMessage as ChatMessageType, Connect4Game, Connect4Cell } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

interface Connect4PageProps {
  theme: Theme;
}

type Cell = Connect4Cell;
const ROWS = 6;
const COLS = 7;
type GameMode = 'local' | 'lobby' | 'online';

function createBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function checkWin(board: Cell[][], player: Cell): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
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

function genGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

// ── Themed style helpers ─────────────────────────────────────────────────────
const cardStyle = { backgroundColor: 'var(--fs-card-bg)', borderColor: 'var(--fs-border)', borderRadius: 'var(--fs-radius)', boxShadow: 'var(--fs-card-shadow)' } as React.CSSProperties;
const inputStyle = { backgroundColor: 'var(--fs-input-bg)', borderColor: 'var(--fs-input-border)', borderRadius: 'var(--fs-radius)' } as React.CSSProperties;
const dividerStyle = { borderColor: 'var(--fs-divider-muted)' } as React.CSSProperties;
const accentText = 'text-[color:var(--fs-nav-active-text)]';
const accentBgStyle = { backgroundColor: 'var(--fs-footer-schedule-bg)', color: 'white', borderRadius: 'var(--fs-radius)' } as React.CSSProperties;
const accentBorderStyle = { borderColor: 'var(--fs-footer-schedule-bg)', color: 'var(--fs-nav-active-text)', borderRadius: 'var(--fs-radius)' } as React.CSSProperties;

// ── Player indicator ──────────────────────────────────────────────────────────
const PlayerBar: React.FC<{
  color: 'red' | 'yellow';
  name: string;
  isActive: boolean;
  hasWon: boolean;
  theme: Theme;
}> = ({ color, name, isActive, hasWon, theme }) => (
  <div
    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 border-2 transition-all duration-200 select-none ${
      hasWon
        ? color === 'red' ? 'border-red-500 bg-red-500/15' : 'border-yellow-500 bg-yellow-500/15'
        : isActive
        ? color === 'red' ? 'border-red-500 bg-red-500/10' : 'border-yellow-500 bg-yellow-500/10'
        : 'border-transparent opacity-40'
    }`}
    style={{ borderRadius: 'var(--fs-radius)' }}
  >
    <div className={`w-5 h-5 rounded-full shrink-0 shadow-md border-2 ${
      color === 'red'
        ? 'bg-red-500 border-red-300'
        : 'bg-yellow-400 border-yellow-200'
    } ${isActive && !hasWon ? 'animate-pulse' : ''}`} />
    <span className={`text-xs font-bold truncate ${
      isActive || hasWon
        ? color === 'red' ? 'text-red-500' : 'text-yellow-500'
        : theme.textMuted
    }`}>{name}</span>
    {isActive && !hasWon && (
      <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider shrink-0 ${color === 'red' ? 'text-red-500' : 'text-yellow-500'}`}>
        ▶ Turn
      </span>
    )}
    {hasWon && (
      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide shrink-0">🏆</span>
    )}
  </div>
);

// ── Shared game board ────────────────────────────────────────────────────────
const GameBoard: React.FC<{
  board: Cell[][];
  onDrop: (col: number) => void;
  disabled: boolean;
  currentTurn: 'red' | 'yellow';
  winner: string | null;
  redName: string;
  yellowName: string;
  isMyTurn?: boolean;
  theme: Theme;
  footer?: React.ReactNode;
}> = ({ board, onDrop, disabled, currentTurn, winner, redName, yellowName, isMyTurn, theme, footer }) => {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div>
      {/* Player header bars */}
      <div className="flex gap-2 mb-3">
        <PlayerBar
          color="red"
          name={redName}
          isActive={!winner && currentTurn === 'red'}
          hasWon={winner === 'red'}
          theme={theme}
        />
        <PlayerBar
          color="yellow"
          name={yellowName}
          isActive={!winner && currentTurn === 'yellow'}
          hasWon={winner === 'yellow'}
          theme={theme}
        />
      </div>

      {/* Board */}
      <div className="flex justify-center">
        <div
          className="inline-grid gap-1.5 p-3 border-2"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            backgroundColor: theme.isDark ? '#0f172a' : '#1a3050',
            borderColor: theme.isDark ? '#334155' : '#1a3050',
            borderRadius: 'var(--fs-radius)',
          }}
          onMouseLeave={() => setHoveredCol(null)}
        >
          {board.flat().map((cell, i) => {
            const col = i % COLS;
            const canHover = !disabled && !winner && hoveredCol === col;
            const wouldDrop = canHover && getLowestEmptyRow(board, col) >= 0;
            return (
              <button
                key={i}
                onClick={() => !disabled && onDrop(col)}
                onMouseEnter={() => !disabled && setHoveredCol(col)}
                disabled={disabled}
                aria-label={`Column ${col + 1}`}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all duration-150 active:scale-90 disabled:cursor-default ${
                  cell === 'red'
                    ? 'bg-red-500 border-red-300 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.4)]'
                    : cell === 'yellow'
                    ? 'bg-yellow-400 border-yellow-200 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.25)]'
                    : wouldDrop
                    ? currentTurn === 'red'
                      ? 'bg-red-500/35 border-red-400/70'
                      : 'bg-yellow-400/35 border-yellow-300/70'
                    : 'bg-white/12 border-white/18 hover:bg-white/22'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 text-center space-y-2">
        {winner === 'draw' ? (
          <p className={`text-base font-barDisplay font-bold uppercase ${theme.text}`}>It's a draw!</p>
        ) : winner ? (
          <p className={`text-lg font-barDisplay font-bold uppercase ${winner === 'red' ? 'text-red-500' : 'text-yellow-400'}`}>
            {winner === 'red' ? redName : yellowName} wins!
          </p>
        ) : (
          <p className={`text-sm ${theme.textMuted}`}>
            {isMyTurn === true && (
              <span className="font-bold text-emerald-500 uppercase tracking-wide text-xs">Your turn!</span>
            )}
            {isMyTurn === false && (
              <span>Waiting for opponent…</span>
            )}
            {isMyTurn === undefined && (
              <>
                <span className={`font-barDisplay font-bold ${currentTurn === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {currentTurn === 'red' ? redName : yellowName}
                </span>
                {' '}to move
              </>
            )}
          </p>
        )}
        {footer}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Connect4Page: React.FC<Connect4PageProps> = ({ theme }) => {
  const auth = useAuth();
  const { user, profile, loading: authLoading, error: authError, signInWithEmail, signOut, updateProfile, clearError } = auth;

  // Local game
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [turn, setTurn] = useState<'red' | 'yellow'>('red');
  const [winner, setWinner] = useState<Cell>(null);
  const [leftName, setLeftName] = useState('Player 1');
  const [rightName, setRightName] = useState('Player 2');

  // Game mode
  const [gameMode, setGameMode] = useState<GameMode>('local');

  // Online game
  const [onlineGames, setOnlineGames] = useState<Connect4Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Connect4Game | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [gameLoading, setGameLoading] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(false);

  // Auth form
  const [emailInput, setEmailInput] = useState('');
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

  // Derived online state
  const myColor: 'red' | 'yellow' | null = currentGame
    ? currentGame.player1_id === user?.id ? 'red'
    : currentGame.player2_id === user?.id ? 'yellow'
    : null
    : null;
  const isMyTurn = currentGame?.status === 'playing' && myColor !== null
    ? currentGame.current_turn === myColor
    : undefined;
  const isSpectating = currentGame !== null && myColor === null;

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoggedIn && profile?.display_name) setLeftName(profile.display_name);
  }, [isLoggedIn, profile?.display_name]);

  // High scores
  useEffect(() => {
    if (!supabase || !isSocial) return;
    supabase
      .from('connect4_scores').select('*').order('wins', { ascending: false }).limit(8)
      .then(({ data }) => setHighScores((data as Connect4Score[]) || []));
  }, [isSocial, winner, currentGame?.winner]);

  // Chat load + realtime
  useEffect(() => {
    if (!supabase || !isSocial) return;
    supabase.from('connect4_chat').select('*').order('created_at', { ascending: true }).limit(50)
      .then(({ data }) => setChatMessages((data as ChatMessageType[]) || []));
    const ch = supabase.channel('connect4_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connect4_chat' },
        (payload) => setChatMessages(prev => [...prev, payload.new as ChatMessageType]))
      .subscribe();
    return () => { supabase?.removeChannel(ch); };
  }, [isSocial]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Lobby: load games + subscribe
  const loadGames = useCallback(() => {
    if (!supabase || !isSocial) return;
    setGamesLoading(true);
    supabase.from('connect4_games').select('*').in('status', ['waiting', 'playing'])
      .order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { setOnlineGames((data as Connect4Game[]) || []); setGamesLoading(false); });
  }, [isSocial]);

  useEffect(() => {
    if (gameMode !== 'lobby' || !isSocial || !supabase) return;
    loadGames();
    const ch = supabase.channel('connect4_games_lobby')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connect4_games' }, loadGames)
      .subscribe();
    return () => { supabase?.removeChannel(ch); };
  }, [gameMode, isSocial, loadGames]);

  // Online game: subscribe to current game changes
  useEffect(() => {
    if (gameMode !== 'online' || !currentGame || !supabase) return;
    const ch = supabase.channel(`game_${currentGame.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'connect4_games', filter: `id=eq.${currentGame.id}` },
        (payload) => setCurrentGame(payload.new as Connect4Game))
      .subscribe();
    return () => { supabase?.removeChannel(ch); };
  }, [gameMode, currentGame?.id]);

  // ── Local game ────────────────────────────────────────────────────────────

  const drop = useCallback((col: number) => {
    if (winner) return;
    const row = getLowestEmptyRow(board, col);
    if (row < 0) return;
    const next = board.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? turn : c) : [...r]);
    setBoard(next);
    if (checkWin(next, turn)) {
      setWinner(turn);
      if (isRanked && supabase && user && profile && turn === 'red') {
        const name = profile.display_name || profile.email || 'Player';
        supabase.from('connect4_scores').select('wins').eq('user_id', user.id).single().then(({ data }) => {
          supabase!.from('connect4_scores').upsert(
            { user_id: user.id, display_name: name, wins: (data?.wins ?? 0) + 1, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          );
        });
      }
    } else {
      setTurn(t => t === 'red' ? 'yellow' : 'red');
    }
  }, [board, turn, winner, isRanked, user, profile]);

  const reset = useCallback(() => { setBoard(createBoard()); setTurn('red'); setWinner(null); }, []);

  // ── Online game actions ───────────────────────────────────────────────────

  const createOnlineGame = async () => {
    if (!user || !profile || !supabase) return;
    setGameLoading(true); setGameError(null);
    try {
      const { data, error } = await supabase.from('connect4_games').insert({
        game_code: genGameCode(),
        player1_id: user.id,
        player1_name: profile.display_name || profile.email || 'Player 1',
        board: createBoard(),
        status: 'waiting',
        current_turn: 'red',
      }).select().single();
      if (error) throw error;
      setCurrentGame(data as Connect4Game);
      setGameMode('online');
    } catch (e) {
      setGameError(e instanceof Error ? e.message : 'Failed to create game');
    } finally {
      setGameLoading(false);
    }
  };

  const joinOnlineGame = async (code: string) => {
    if (!user || !profile || !supabase) return;
    setGameLoading(true); setGameError(null);
    try {
      const { data: rows, error: findErr } = await supabase.from('connect4_games')
        .select('*').eq('game_code', code.toUpperCase().trim()).eq('status', 'waiting');
      if (findErr) throw findErr;
      if (!rows || rows.length === 0) throw new Error('Game not found or already started');
      const game = rows[0] as Connect4Game;
      if (game.player1_id === user.id) throw new Error("Can't join your own game — share the code!");
      const { data, error } = await supabase.from('connect4_games').update({
        player2_id: user.id,
        player2_name: profile.display_name || profile.email || 'Player 2',
        status: 'playing',
        updated_at: new Date().toISOString(),
      }).eq('id', game.id).select().single();
      if (error) throw error;
      setCurrentGame(data as Connect4Game);
      setGameMode('online');
    } catch (e) {
      setGameError(e instanceof Error ? e.message : 'Failed to join game');
    } finally {
      setGameLoading(false);
    }
  };

  const watchGame = async (gameId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('connect4_games').select('*').eq('id', gameId).single();
    if (data) { setCurrentGame(data as Connect4Game); setGameMode('online'); }
  };

  const dropOnline = async (col: number) => {
    if (!currentGame || !user || !supabase || currentGame.status !== 'playing') return;
    const me: Cell = currentGame.player1_id === user.id ? 'red' : 'yellow';
    if (currentGame.current_turn !== me) return;
    const row = getLowestEmptyRow(currentGame.board as Cell[][], col);
    if (row < 0) return;

    const next = (currentGame.board as Cell[][]).map((r, ri) =>
      ri === row ? r.map((c, ci) => ci === col ? me : c) : [...r]
    ) as Cell[][];

    const didWin = checkWin(next, me);
    const isDraw = !didWin && next.every(r => r.every(c => c !== null));

    const updates: Partial<Connect4Game> = {
      board: next,
      current_turn: me === 'red' ? 'yellow' : 'red',
      updated_at: new Date().toISOString(),
    };
    if (didWin || isDraw) {
      updates.status = 'finished';
      updates.winner = didWin ? me as 'red' | 'yellow' : 'draw';
    }

    if (didWin && isRanked && profile) {
      const name = profile.display_name || profile.email || 'Player';
      supabase.from('connect4_scores').select('wins').eq('user_id', user.id).single().then(({ data }) => {
        supabase!.from('connect4_scores').upsert(
          { user_id: user.id, display_name: name, wins: (data?.wins ?? 0) + 1, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      });
    }

    const { data, error } = await supabase.from('connect4_games')
      .update(updates).eq('id', currentGame.id).select().single();
    if (!error && data) setCurrentGame(data as Connect4Game);
  };

  const cancelOnlineGame = async () => {
    if (!currentGame || !user || !supabase) return;
    await supabase.from('connect4_games').delete().eq('id', currentGame.id).eq('player1_id', user.id);
    setCurrentGame(null);
    setGameMode('lobby');
  };

  const leaveGame = () => { setCurrentGame(null); setGameMode('lobby'); };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // ── Auth helpers ──────────────────────────────────────────────────────────

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
    e.preventDefault(); clearError(); setAuthSuccess('');
    const { error } = await signInWithEmail(emailInput);
    if (!error) setAuthSuccess('Check your email for the login link.');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-12">

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-2xl font-barDisplay font-bold uppercase tracking-[0.1em] ${theme.text}`}>Connect 4</h2>
          <p className={`text-[10px] uppercase tracking-widest mt-0.5 font-bold ${isRanked ? accentText : theme.textMuted}`}>
            {isRanked ? '★ Ranked — wins count' : isSocial ? 'Sign in to play ranked' : 'Local play'}
          </p>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${theme.text}`}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-barDisplay font-bold text-white shrink-0" style={accentBgStyle}>
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

      {/* Mode tabs */}
      {isSocial && (
        <div className="flex gap-1.5 mb-4">
          <button
            onClick={() => setGameMode('local')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 transition-all"
            style={gameMode === 'local' ? accentBgStyle : { borderColor: 'var(--fs-input-border)', color: 'var(--fs-text-muted)', borderRadius: 'var(--fs-radius)' }}
          >
            <User size={10} /> Local
          </button>
          <button
            onClick={() => setGameMode(gameMode === 'online' && currentGame ? 'online' : 'lobby')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 transition-all"
            style={gameMode !== 'local' ? accentBgStyle : { borderColor: 'var(--fs-input-border)', color: 'var(--fs-text-muted)', borderRadius: 'var(--fs-radius)' }}
          >
            <Wifi size={10} /> Online {onlineGames.filter(g => g.status === 'waiting').length > 0 && gameMode === 'local' && (
              <span className="ml-1 px-1.5 py-0.5 text-[8px] font-bold bg-emerald-500 text-white rounded-full">
                {onlineGames.filter(g => g.status === 'waiting').length} open
              </span>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Left: Game area ── */}
        <div>

          {/* LOCAL GAME */}
          {gameMode === 'local' && (
            <div className="border-2 p-4 sm:p-5" style={cardStyle}>
              <GameBoard
                board={board}
                onDrop={drop}
                disabled={!!winner}
                currentTurn={turn}
                winner={winner}
                redName={leftName}
                yellowName={rightName}
                theme={theme}
                footer={
                  <div className="flex gap-2 justify-center mt-1">
                    <button onClick={reset} className="px-5 py-1.5 text-[10px] font-barDisplay font-bold uppercase tracking-widest hover:opacity-80 transition-opacity" style={accentBgStyle}>
                      New game
                    </button>
                  </div>
                }
              />
              <div className="flex gap-2 mt-4 pt-4 border-t" style={dividerStyle}>
                <input value={leftName} onChange={e => setLeftName(e.target.value)} placeholder="Red player" className={`flex-1 px-3 py-1.5 text-xs border text-center bg-transparent ${theme.text}`} style={{ ...inputStyle, fontSize: 12 }} />
                <input value={rightName} onChange={e => setRightName(e.target.value)} placeholder="Yellow player" className={`flex-1 px-3 py-1.5 text-xs border text-center bg-transparent ${theme.text}`} style={{ ...inputStyle, fontSize: 12 }} />
              </div>
            </div>
          )}

          {/* ONLINE LOBBY */}
          {gameMode === 'lobby' && (
            <div className="border-2 overflow-hidden" style={cardStyle}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={dividerStyle}>
                <div className="flex items-center gap-2">
                  <Wifi size={14} className={accentText} />
                  <span className={`text-sm font-barDisplay font-bold uppercase tracking-wider ${theme.text}`}>Online Games</span>
                </div>
                <button onClick={loadGames} className={`text-[9px] flex items-center gap-1 ${theme.textMuted} hover:opacity-80`}>
                  <RefreshCw size={9} /> Refresh
                </button>
              </div>

              {/* Create + Join */}
              <div className="p-4 border-b" style={dividerStyle}>
                <div className="flex gap-2 flex-wrap">
                  {isLoggedIn ? (
                    <button
                      onClick={createOnlineGame}
                      disabled={gameLoading}
                      className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-barDisplay font-bold uppercase tracking-widest disabled:opacity-50 hover:opacity-80 transition-opacity"
                      style={accentBgStyle}
                    >
                      <Plus size={11} /> {gameLoading ? 'Creating…' : 'Create Game'}
                    </button>
                  ) : (
                    <p className={`text-xs py-2 ${theme.textMuted}`}>Sign in to create a game</p>
                  )}
                  <div className="flex gap-1.5 flex-1 min-w-[140px]">
                    <input
                      value={joinCodeInput}
                      onChange={e => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 4))}
                      onKeyDown={e => e.key === 'Enter' && joinCodeInput.length >= 3 && joinOnlineGame(joinCodeInput)}
                      placeholder="CODE"
                      maxLength={4}
                      className={`flex-1 min-w-0 px-3 py-2 text-xs font-bold text-center uppercase tracking-[0.3em] border ${theme.text}`}
                      style={inputStyle}
                    />
                    <button
                      onClick={() => joinOnlineGame(joinCodeInput)}
                      disabled={!isLoggedIn || joinCodeInput.length < 3 || gameLoading}
                      className="px-3 py-2 text-[10px] font-barDisplay font-bold uppercase tracking-wider disabled:opacity-40 hover:opacity-80 transition-opacity"
                      style={accentBgStyle}
                    >
                      Join
                    </button>
                  </div>
                </div>
                {gameError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle size={11} /> {gameError}
                  </div>
                )}
              </div>

              {/* Games list */}
              <div className="divide-y" style={{ borderColor: 'var(--fs-divider-muted)' }}>
                {gamesLoading && (
                  <p className={`px-4 py-8 text-xs text-center ${theme.textMuted}`}>Loading…</p>
                )}
                {!gamesLoading && onlineGames.length === 0 && (
                  <div className="px-4 py-10 text-center space-y-2">
                    <p className={`text-sm font-bold ${theme.text}`}>No active games</p>
                    <p className={`text-xs ${theme.textMuted}`}>{isLoggedIn ? 'Create one and share the code!' : 'Sign in to start playing online.'}</p>
                  </div>
                )}
                {onlineGames.map(game => {
                  const isOpen = game.status === 'waiting';
                  const isMyGame = game.player1_id === user?.id || game.player2_id === user?.id;
                  return (
                    <div key={game.id} className={`flex items-center gap-3 px-4 py-3 ${isMyGame ? 'bg-[var(--fs-quad-green-bg)]' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-300 shrink-0" />
                            <span className={`text-xs font-bold truncate max-w-[80px] ${theme.text}`}>{game.player1_name}</span>
                          </div>
                          {game.player2_name ? (
                            <>
                              <span className={`text-[9px] ${theme.textMuted}`}>vs</span>
                              <div className="flex items-center gap-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-200 shrink-0" />
                                <span className={`text-xs font-bold truncate max-w-[80px] ${theme.text}`}>{game.player2_name}</span>
                              </div>
                            </>
                          ) : (
                            <span className={`text-[10px] italic ${theme.textMuted}`}>waiting for opponent…</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide ${isOpen ? 'text-amber-500' : 'text-emerald-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            {isOpen ? 'Open' : 'In Progress'}
                          </span>
                          <span className={`text-[9px] flex items-center gap-0.5 ${theme.textMuted}`}>
                            <Clock size={8} /> {timeAgo(game.created_at)}
                          </span>
                          <span className={`text-[9px] font-mono font-bold tracking-widest ${theme.textMuted}`}>#{game.game_code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOpen && isLoggedIn && game.player1_id !== user?.id && (
                          <button
                            onClick={() => joinOnlineGame(game.game_code)}
                            className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                            style={accentBgStyle}
                          >
                            Join
                          </button>
                        )}
                        {isMyGame && isOpen && (
                          <button
                            onClick={() => copyCode(game.game_code)}
                            className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono font-bold border-2 border-dashed ${accentText}`}
                            style={{ borderColor: 'var(--fs-nav-active-text)', borderRadius: 'var(--fs-radius)' }}
                            title="Copy game code"
                          >
                            {game.game_code}
                            {codeCopied ? <Check size={9} className="text-emerald-500" /> : <Copy size={9} />}
                          </button>
                        )}
                        <button
                          onClick={() => watchGame(game.id)}
                          className={`flex items-center gap-0.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider border hover:opacity-80 transition-opacity`}
                          style={{ borderColor: 'var(--fs-input-border)', color: 'var(--fs-text-muted)', borderRadius: 'var(--fs-radius)' }}
                        >
                          <Eye size={9} /> {isMyGame ? 'Resume' : 'Watch'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ONLINE GAME */}
          {gameMode === 'online' && currentGame && (
            <div className="border-2 p-4 sm:p-5" style={cardStyle}>
              {/* Back bar */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={leaveGame} className={`flex items-center gap-1 text-[10px] uppercase tracking-wider ${theme.textMuted} hover:opacity-80`}>
                  <ArrowLeft size={11} /> Lobby
                </button>
                <div className="flex items-center gap-2">
                  {isSpectating && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider text-amber-500 border border-amber-300 px-2 py-0.5`} style={{ borderRadius: 'var(--fs-radius)' }}>
                      👁 Watching
                    </span>
                  )}
                  {myColor && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider border-2 px-2 py-0.5 flex items-center gap-1 ${myColor === 'red' ? 'border-red-400 text-red-500' : 'border-yellow-400 text-yellow-500'}`} style={{ borderRadius: 'var(--fs-radius)' }}>
                      <div className={`w-2.5 h-2.5 rounded-full ${myColor === 'red' ? 'bg-red-500' : 'bg-yellow-400'}`} />
                      You are {myColor}
                    </span>
                  )}
                  <span className={`text-[9px] font-mono font-bold tracking-widest ${theme.textMuted}`}>#{currentGame.game_code}</span>
                </div>
              </div>

              {/* Waiting for opponent */}
              {currentGame.status === 'waiting' && (
                <div className="text-center py-10 space-y-5">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-300 animate-pulse" />
                    <span className={`text-base font-bold ${theme.text}`}>{currentGame.player1_name}</span>
                  </div>
                  <p className={`text-xs ${theme.textMuted}`}>Waiting for an opponent…</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => copyCode(currentGame.game_code)}
                      className={`text-3xl font-mono font-bold tracking-[0.4em] border-2 border-dashed px-5 py-3 ${accentText} hover:opacity-80 transition-opacity`}
                      style={{ borderColor: 'var(--fs-nav-active-text)', borderRadius: 'var(--fs-radius)' }}
                      title="Click to copy"
                    >
                      {currentGame.game_code}
                    </button>
                    <div className="text-left space-y-1">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>Share this code</p>
                      <button onClick={() => copyCode(currentGame.game_code)} className={`flex items-center gap-1.5 text-xs border px-2.5 py-1.5 hover:opacity-80 transition-opacity`} style={{ borderColor: 'var(--fs-input-border)', borderRadius: 'var(--fs-radius)', color: 'var(--fs-text-muted)' }}>
                        {codeCopied ? <><Check size={11} className="text-emerald-500" /> Copied!</> : <><Copy size={11} /> Copy code</>}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={cancelOnlineGame}
                    className={`flex items-center gap-1 mx-auto text-[10px] uppercase tracking-wider text-red-400 border border-red-200 px-3 py-1.5 hover:bg-red-50 transition-colors`}
                    style={{ borderRadius: 'var(--fs-radius)' }}
                  >
                    <Trash2 size={10} /> Cancel game
                  </button>
                </div>
              )}

              {/* Active / finished game */}
              {currentGame.status !== 'waiting' && (
                <GameBoard
                  board={currentGame.board as Cell[][]}
                  onDrop={dropOnline}
                  disabled={!isMyTurn || currentGame.status === 'finished'}
                  currentTurn={currentGame.current_turn}
                  winner={currentGame.winner || null}
                  redName={currentGame.player1_name}
                  yellowName={currentGame.player2_name || 'Player 2'}
                  isMyTurn={isMyTurn}
                  theme={theme}
                  footer={
                    currentGame.status === 'finished' ? (
                      <button onClick={leaveGame} className="px-5 py-1.5 text-[10px] font-barDisplay font-bold uppercase tracking-widest hover:opacity-80 transition-opacity mt-1" style={accentBgStyle}>
                        Back to lobby
                      </button>
                    ) : undefined
                  }
                />
              )}
            </div>
          )}

          {/* Fallback: online mode but no game */}
          {gameMode === 'online' && !currentGame && (
            <div className="border-2 p-8 text-center" style={cardStyle}>
              <p className={`text-sm ${theme.textMuted} mb-3`}>No active game selected</p>
              <button onClick={() => setGameMode('lobby')} className="px-4 py-2 text-[10px] font-barDisplay font-bold uppercase tracking-widest hover:opacity-80 transition-opacity" style={accentBgStyle}>
                Go to lobby
              </button>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Sign-in CTA */}
          {isSocial && !isLoggedIn && !authLoading && (
            <div className="border-2 p-4" style={cardStyle}>
              <p className={`text-sm font-barDisplay font-bold uppercase tracking-tight mb-1 ${theme.text}`}>Play ranked online</p>
              <p className={`text-[11px] mb-4 leading-relaxed ${theme.textMuted}`}>
                Join Four Square to track wins, top the leaderboard, and chat with other players.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={`w-full px-3 py-2 border text-xs ${theme.text}`}
                  style={inputStyle}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 text-[10px] font-barDisplay font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                  style={accentBgStyle}
                >
                  <Mail size={10} className="inline mr-1.5" />Send magic link
                </button>
              </form>
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
              <p className={`text-[10px] mb-3 ${theme.textMuted}`}>How you'll appear on the leaderboard and in chat.</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.textMuted}`}>@</span>
                  <input type="text" value={handleInput} onChange={e => setHandleInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} placeholder="yourcoolname" className={`w-full pl-6 pr-3 py-2 border text-xs ${theme.text}`} style={inputStyle} onKeyDown={e => e.key === 'Enter' && saveHandle()} />
                </div>
                <button type="button" onClick={saveHandle} disabled={settingHandle || !handleInput.trim()} className="px-3 py-2 text-[10px] font-barDisplay font-bold uppercase disabled:opacity-40 transition-opacity hover:opacity-80" style={accentBgStyle}>Set</button>
              </div>
            </div>
          )}

          {/* Logged-in user card */}
          {isSocial && isLoggedIn && !needsHandle && (
            <div className="border-2 p-3" style={cardStyle}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-barDisplay font-bold text-white shrink-0" style={accentBgStyle}>
                  {(profile?.display_name || profile?.email || 'P')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${theme.text}`}>{profile?.display_name || profile?.email}</p>
                  <p className={`text-[9px] ${accentText}`}>★ Playing ranked</p>
                </div>
              </div>
              {!profile?.rewards_opted_in && !rewardsJoined ? (
                <button type="button" onClick={() => { updateProfile({ rewards_opted_in: true }); setRewardsJoined(true); }} className="w-full py-2 text-[9px] font-barDisplay font-bold uppercase tracking-wider border-2 flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity" style={accentBorderStyle}>
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
                {!isLoggedIn && <span className={`ml-auto text-[9px] italic ${theme.textMuted}`}>Sign in to compete</span>}
              </div>
              {highScores.length > 0 ? (
                <ul>
                  {highScores.map((s, i) => {
                    const isMe = profile?.display_name === s.display_name;
                    return (
                      <li key={s.id} className="flex items-center justify-between px-3 py-2 text-xs border-b last:border-0" style={{ borderColor: 'var(--fs-divider-muted)', ...(isMe ? { backgroundColor: 'var(--fs-quad-green-bg)' } : {}) }}>
                        <div className="flex items-center gap-2">
                          <span className={`w-4 shrink-0 text-[9px] font-barDisplay font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : theme.textMuted}`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                          </span>
                          <span className={isMe ? `font-bold ${accentText}` : theme.text}>{s.display_name}</span>
                        </div>
                        <span className="font-barDisplay font-bold tabular-nums" style={isMe ? { color: 'var(--fs-nav-active-text)' } : { color: 'var(--fs-text-muted)' }}>
                          {s.wins}W
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={`px-3 py-5 text-xs text-center ${theme.textMuted}`}>No ranked games yet —<br />be first!</p>
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
            {!isLoggedIn && <span className={`ml-auto text-[9px] italic ${theme.textMuted}`}>Sign in to send messages</span>}
          </div>
          <div className="h-32 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">
            {chatMessages.length === 0 && <p className={`text-[10px] text-center py-6 ${theme.textMuted}`}>No messages yet — say hi!</p>}
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
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={`Message as ${profile?.display_name || 'you'}…`} className={`flex-1 min-w-0 px-3 py-2 text-xs border ${theme.text}`} style={inputStyle} />
              <button type="button" onClick={sendChat} className="p-2" style={accentBgStyle} aria-label="Send">
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
