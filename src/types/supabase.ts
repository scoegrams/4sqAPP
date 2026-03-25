export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  rewards_opted_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface Connect4Score {
  id: string;
  user_id: string;
  display_name: string;
  wins: number;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  display_name: string;
  message: string;
  created_at: string;
}

export type Connect4Cell = null | 'red' | 'yellow';

export interface Connect4Game {
  id: string;
  game_code: string;
  status: 'waiting' | 'playing' | 'finished';
  player1_id: string;
  player1_name: string;
  player2_id: string | null;
  player2_name: string | null;
  board: Connect4Cell[][];
  current_turn: 'red' | 'yellow';
  winner: 'red' | 'yellow' | 'draw' | null;
  created_at: string;
  updated_at: string;
}
