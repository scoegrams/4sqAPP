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
