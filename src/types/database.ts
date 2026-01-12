export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string;
          timestamp: string;
          symbol: string;
          side: 'long' | 'short' | 'unknown';
          realized_pnl: number;
          fees: number | null;
          roi: number | null;
          result: 'win' | 'loss' | 'breakeven';
          needs_review: boolean;
          confidence_timestamp: 'high' | 'medium' | 'low';
          confidence_symbol: 'high' | 'medium' | 'low';
          confidence_pnl: 'high' | 'medium' | 'low';
          confidence_overall: 'high' | 'medium' | 'low';
          source_image_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          timestamp: string;
          symbol: string;
          side?: 'long' | 'short' | 'unknown';
          realized_pnl: number;
          fees?: number | null;
          roi?: number | null;
          result: 'win' | 'loss' | 'breakeven';
          needs_review?: boolean;
          confidence_timestamp?: 'high' | 'medium' | 'low';
          confidence_symbol?: 'high' | 'medium' | 'low';
          confidence_pnl?: 'high' | 'medium' | 'low';
          confidence_overall?: 'high' | 'medium' | 'low';
          source_image_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          timestamp?: string;
          symbol?: string;
          side?: 'long' | 'short' | 'unknown';
          realized_pnl?: number;
          fees?: number | null;
          roi?: number | null;
          result?: 'win' | 'loss' | 'breakeven';
          needs_review?: boolean;
          confidence_timestamp?: 'high' | 'medium' | 'low';
          confidence_symbol?: 'high' | 'medium' | 'low';
          confidence_pnl?: 'high' | 'medium' | 'low';
          confidence_overall?: 'high' | 'medium' | 'low';
          source_image_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type TradeRow = Database['public']['Tables']['trades']['Row'];
export type TradeInsert = Database['public']['Tables']['trades']['Insert'];
export type TradeUpdate = Database['public']['Tables']['trades']['Update'];
