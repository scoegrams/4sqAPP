import React, { useState, useCallback } from 'react';
import { Theme } from '../../theme';

interface Connect4PageProps {
  theme: Theme;
}

type Cell = null | 'red' | 'yellow';
const ROWS = 6;
const COLS = 7;

const createBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const checkWin = (board: Cell[][], player: Cell): boolean => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      const dirs = [[0,1],[1,0],[1,1],[1,-1]];
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
};

const Connect4Page: React.FC<Connect4PageProps> = ({ theme }) => {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [turn, setTurn] = useState<'red' | 'yellow'>('red');
  const [winner, setWinner] = useState<Cell>(null);

  const drop = useCallback((col: number) => {
    if (winner) return;
    setBoard(prev => {
      const next = prev.map(r => [...r]);
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!next[r][col]) {
          next[r][col] = turn;
          if (checkWin(next, turn)) {
            setWinner(turn);
          } else {
            setTurn(t => t === 'red' ? 'yellow' : 'red');
          }
          return next;
        }
      }
      return prev;
    });
  }, [turn, winner]);

  const reset = () => { setBoard(createBoard()); setTurn('red'); setWinner(null); };

  const isMbta = theme.mode === 'mbta';
  const accent = isMbta ? 'text-[#00843D]' : theme.isDark ? 'text-emerald-400' : 'text-emerald-700';

  return (
    <div className="max-w-md mx-auto px-6 py-10 text-center">
      <h2 className={`text-2xl font-black uppercase tracking-[0.15em] mb-4 ${accent}`}>
        Connect 4
      </h2>
      <p className={`text-xs mb-4 ${theme.textMuted}`}>
        {winner
          ? `${winner === 'red' ? 'Red' : 'Yellow'} wins!`
          : `${turn === 'red' ? 'Red' : 'Yellow'}'s turn`}
      </p>

      <div
        className={`inline-grid gap-1.5 p-3 border-2 ${theme.isDark ? 'bg-slate-800 border-slate-700' : isMbta ? 'bg-[#003DA5] border-[#003DA5]' : 'bg-blue-700 border-blue-800'}`}
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {board.flat().map((cell, i) => {
          const col = i % COLS;
          return (
            <button
              key={i}
              onClick={() => drop(col)}
              className={`w-10 h-10 rounded-full border-2 transition-colors ${
                cell === 'red'
                  ? 'bg-red-500 border-red-400'
                  : cell === 'yellow'
                  ? 'bg-yellow-400 border-yellow-300'
                  : theme.isDark
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-700'
                  : 'bg-white border-white/50 hover:bg-blue-100'
              }`}
            />
          );
        })}
      </div>

      <div className="mt-4">
        <button
          onClick={reset}
          className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            isMbta ? 'bg-[#DA291C] text-white' : theme.isDark ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default Connect4Page;
