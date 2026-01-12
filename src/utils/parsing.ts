import { ParsingConfig, ParsedTradeData, ConfidenceLevel, FieldConfidence } from '@/types';
import { parseFlexibleDate } from './dates';

export const parsingConfig: ParsingConfig = {
  datePatterns: [
    {
      name: 'ISO format',
      pattern: /(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})/,
      extract: (match) => match[1],
      confidence: 'high',
    },
    {
      name: 'Slash format',
      pattern: /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/,
      extract: (match) => match[1],
      confidence: 'high',
    },
    {
      name: 'Date time format',
      pattern: /(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2})/,
      extract: (match) => match[1],
      confidence: 'high',
    },
    {
      name: 'Short date',
      pattern: /(\d{2}-\d{2}-\d{4})/,
      extract: (match) => match[1],
      confidence: 'medium',
    },
  ],
  symbolPatterns: [
    {
      name: 'USDT pair',
      pattern: /([A-Z]{2,10}USDT)/i,
      extract: (match) => match[1].toUpperCase(),
      confidence: 'high',
    },
    {
      name: 'USD pair',
      pattern: /([A-Z]{2,10}USD)\b/i,
      extract: (match) => match[1].toUpperCase(),
      confidence: 'high',
    },
    {
      name: 'Perp format',
      pattern: /([A-Z]{2,10})[\s/-]?(PERP|PERPETUAL)/i,
      extract: (match) => `${match[1].toUpperCase()}USDT`,
      confidence: 'medium',
    },
    {
      name: 'Slash pair',
      pattern: /([A-Z]{2,10})\/([A-Z]{2,5})/i,
      extract: (match) => `${match[1].toUpperCase()}${match[2].toUpperCase()}`,
      confidence: 'medium',
    },
  ],
  pnlPatterns: [
    {
      name: 'PnL with sign',
      pattern: /([+-]?\s*[\d,]+\.?\d*)\s*(?:USDT|USD)/i,
      extract: (match) => parseFloat(match[1].replace(/[,\s]/g, '')),
      confidence: 'high',
    },
    {
      name: 'Negative in parens',
      pattern: /\((\d+\.?\d*)\)\s*(?:USDT|USD)?/i,
      extract: (match) => -parseFloat(match[1]),
      confidence: 'high',
    },
    {
      name: 'PnL number only',
      pattern: /PNL[:\s]+([+-]?\s*[\d,]+\.?\d*)/i,
      extract: (match) => parseFloat(match[1].replace(/[,\s]/g, '')),
      confidence: 'medium',
    },
    {
      name: 'Realized PnL',
      pattern: /Realized\s+(?:PnL|P&L|Profit)[:\s]+([+-]?\s*[\d,]+\.?\d*)/i,
      extract: (match) => parseFloat(match[1].replace(/[,\s]/g, '')),
      confidence: 'high',
    },
  ],
  roiPatterns: [
    {
      name: 'ROI percentage',
      pattern: /ROI[:\s]+([+-]?\s*[\d,]+\.?\d*)\s*%/i,
      extract: (match) => parseFloat(match[1].replace(/[,\s]/g, '')),
      confidence: 'high',
    },
    {
      name: 'Return percentage',
      pattern: /Return[:\s]+([+-]?\s*[\d,]+\.?\d*)\s*%/i,
      extract: (match) => parseFloat(match[1].replace(/[,\s]/g, '')),
      confidence: 'high',
    },
    {
      name: 'Percentage only',
      pattern: /([+-]?\d+\.?\d*)\s*%/,
      extract: (match) => parseFloat(match[1]),
      confidence: 'low',
    },
  ],
  feePatterns: [
    {
      name: 'Fee with label',
      pattern: /Fee[s]?[:\s]+([+-]?\s*[\d,]+\.?\d*)\s*(?:USDT|USD)?/i,
      extract: (match) => parseFloat(match[1].replace(/[,\s]/g, '')),
      confidence: 'high',
    },
    {
      name: 'Trading fee',
      pattern: /Trading\s+Fee[:\s]+([+-]?\s*[\d,]+\.?\d*)/i,
      extract: (match) => parseFloat(match[1].replace(/[,\s]/g, '')),
      confidence: 'high',
    },
  ],
  sidePatterns: [
    {
      name: 'Long explicit',
      pattern: /\b(LONG|Buy|Open\s+Long)\b/i,
      extract: () => 'long',
      confidence: 'high',
    },
    {
      name: 'Short explicit',
      pattern: /\b(SHORT|Sell|Open\s+Short)\b/i,
      extract: () => 'short',
      confidence: 'high',
    },
  ],
  keywordAnchors: {
    pnl: ['PNL', 'P&L', 'Profit', 'Loss', 'Realized', 'Net'],
    roi: ['ROI', 'Return', '%'],
    fee: ['Fee', 'Fees', 'Commission'],
    symbol: ['Pair', 'Symbol', 'Contract', 'Asset'],
    date: ['Date', 'Time', 'Closed', 'Close'],
  },
};

function createEmptyFieldConfidence(): FieldConfidence {
  return { value: null, confidence: 'low' };
}

function findNearKeyword(lines: string[], keywords: string[], lineIndex: number): boolean {
  const searchRange = 2;
  const start = Math.max(0, lineIndex - searchRange);
  const end = Math.min(lines.length, lineIndex + searchRange + 1);

  for (let i = start; i < end; i++) {
    const line = lines[i].toLowerCase();
    if (keywords.some((kw) => line.includes(kw.toLowerCase()))) {
      return true;
    }
  }
  return false;
}

export function parseOCRText(text: string): ParsedTradeData {
  const lines = text.split('\n').filter((line) => line.trim());
  const fullText = text;

  const result: ParsedTradeData = {
    timestamp: createEmptyFieldConfidence(),
    symbol: createEmptyFieldConfidence(),
    side: createEmptyFieldConfidence(),
    realizedPnl: createEmptyFieldConfidence(),
    fees: createEmptyFieldConfidence(),
    roi: createEmptyFieldConfidence(),
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of parsingConfig.datePatterns) {
      const match = line.match(pattern.pattern);
      if (match && !result.timestamp.value) {
        const dateStr = pattern.extract(match) as string;
        const parsed = parseFlexibleDate(dateStr);
        if (parsed) {
          const nearKeyword = findNearKeyword(lines, parsingConfig.keywordAnchors.date, i);
          result.timestamp = {
            value: parsed.toISOString(),
            confidence: nearKeyword ? pattern.confidence : lowerConfidence(pattern.confidence),
            rawText: dateStr,
          };
          break;
        }
      }
    }
  }

  for (const pattern of parsingConfig.symbolPatterns) {
    const match = fullText.match(pattern.pattern);
    if (match && !result.symbol.value) {
      result.symbol = {
        value: pattern.extract(match) as string,
        confidence: pattern.confidence,
        rawText: match[0],
      };
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nearPnlKeyword = findNearKeyword(lines, parsingConfig.keywordAnchors.pnl, i);

    for (const pattern of parsingConfig.pnlPatterns) {
      const match = line.match(pattern.pattern);
      if (match && !result.realizedPnl.value) {
        const value = pattern.extract(match) as number;
        if (!isNaN(value)) {
          result.realizedPnl = {
            value,
            confidence: nearPnlKeyword ? pattern.confidence : lowerConfidence(pattern.confidence),
            rawText: match[0],
          };
          break;
        }
      }
    }
    if (result.realizedPnl.value) break;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of parsingConfig.roiPatterns) {
      const match = line.match(pattern.pattern);
      if (match && !result.roi.value) {
        const value = pattern.extract(match) as number;
        if (!isNaN(value)) {
          result.roi = {
            value,
            confidence: pattern.confidence,
            rawText: match[0],
          };
          break;
        }
      }
    }
    if (result.roi.value) break;
  }

  for (const pattern of parsingConfig.feePatterns) {
    const match = fullText.match(pattern.pattern);
    if (match && !result.fees.value) {
      const value = pattern.extract(match) as number;
      if (!isNaN(value)) {
        result.fees = {
          value,
          confidence: pattern.confidence,
          rawText: match[0],
        };
        break;
      }
    }
  }

  for (const pattern of parsingConfig.sidePatterns) {
    const match = fullText.match(pattern.pattern);
    if (match && !result.side.value) {
      result.side = {
        value: pattern.extract(match) as string,
        confidence: pattern.confidence,
        rawText: match[0],
      };
      break;
    }
  }

  return result;
}

function lowerConfidence(level: ConfidenceLevel): ConfidenceLevel {
  switch (level) {
    case 'high':
      return 'medium';
    case 'medium':
      return 'low';
    default:
      return 'low';
  }
}

export function calculateOverallConfidence(data: ParsedTradeData): ConfidenceLevel {
  const criticalFields = [data.timestamp, data.symbol, data.realizedPnl];
  const confidenceLevels = criticalFields.map((f) => f.confidence);

  if (confidenceLevels.every((c) => c === 'high')) {
    return 'high';
  }
  if (confidenceLevels.some((c) => c === 'low')) {
    return 'low';
  }
  return 'medium';
}

export function needsReview(data: ParsedTradeData): boolean {
  const hasAllCritical =
    data.timestamp.value !== null &&
    data.symbol.value !== null &&
    data.realizedPnl.value !== null;

  if (!hasAllCritical) return true;

  const overallConfidence = calculateOverallConfidence(data);
  return overallConfidence === 'low';
}
