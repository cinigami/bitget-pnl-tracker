export type TradeResult = 'win' | 'loss' | 'breakeven';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FieldConfidence {
  value: string | number | null;
  confidence: ConfidenceLevel;
  rawText?: string;
}

export interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'long' | 'short' | 'unknown';
  realizedPnl: number;
  fees: number | null;
  roi: number | null;
  result: TradeResult;
  needsReview: boolean;
  confidence: {
    timestamp: ConfidenceLevel;
    symbol: ConfidenceLevel;
    pnl: ConfidenceLevel;
    overall: ConfidenceLevel;
  };
  sourceImageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedTradeData {
  timestamp: FieldConfidence;
  symbol: FieldConfidence;
  side: FieldConfidence;
  realizedPnl: FieldConfidence;
  fees: FieldConfidence;
  roi: FieldConfidence;
}

export interface OCRResult {
  text: string;
  confidence: number;
  parsedData: ParsedTradeData;
  rawLines: string[];
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  ocrResult?: OCRResult;
  trade?: Trade;
  error?: string;
}

export interface WeeklyMetrics {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  netPnl: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
}

export interface DailyPnl {
  date: string;
  pnl: number;
  trades: number;
}

export interface AppState {
  trades: Trade[];
  currentWeek: string;
}

export interface ParsingRule {
  name: string;
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => string | number;
  confidence: ConfidenceLevel;
}

export interface ParsingConfig {
  datePatterns: ParsingRule[];
  symbolPatterns: ParsingRule[];
  pnlPatterns: ParsingRule[];
  roiPatterns: ParsingRule[];
  feePatterns: ParsingRule[];
  sidePatterns: ParsingRule[];
  keywordAnchors: {
    pnl: string[];
    roi: string[];
    fee: string[];
    symbol: string[];
    date: string[];
  };
}
