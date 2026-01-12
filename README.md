# Bitget PnL Crypto Tracker

A production-ready web app for tracking trading performance week-by-week with screenshot-based OCR import from Bitget PnL screens.

**Live Demo:** [https://crypto-dashboard12.netlify.app/](https://crypto-dashboard12.netlify.app/)

---

## Features

### Screenshot Import Pipeline
- Drag & drop upload for Bitget PnL screenshots
- Tesseract.js OCR with progress tracking
- Automatic extraction of trade data (symbol, PnL, ROI, fees, date)
- Confidence scoring (High/Medium/Low) per field
- Edit parsed records to correct OCR mistakes
- Duplicate detection with merge/skip options

### Weekly Analytics Dashboard
- ISO week selector with navigation
- **KPI Cards:** Net PnL, Win Rate, Total Trades, Avg Win, Avg Loss, Profit Factor, Max Drawdown, Best Day
- **Charts:** Weekly Net PnL (12 weeks), Win/Loss distribution, Cumulative equity curve
- Real-time metrics calculation

### Trades Management
- Sortable and filterable trades table
- Search by symbol
- Filter by result (Win/Loss/Needs Review)
- Inline edit and delete actions
- Pagination for large datasets

### Data Persistence
- **Supabase Integration:** Cloud sync across devices
- **LocalStorage Fallback:** Works offline when Supabase not configured
- Export/Import JSON backups
- Shareable weekly summary text

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Styling with dark mode |
| Tesseract.js | Client-side OCR |
| Recharts | Charts and visualizations |
| @tanstack/react-table | Data tables |
| date-fns | Date manipulation |
| Supabase | Cloud database |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cinigami/bitget-pnl-tracker.git
cd bitget-pnl-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase Setup (Optional)

For cloud sync across devices:

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project

### 2. Run Database Migration
In Supabase SQL Editor, run:

```sql
-- Create enum types
CREATE TYPE trade_side AS ENUM ('long', 'short', 'unknown');
CREATE TYPE trade_result AS ENUM ('win', 'loss', 'breakeven');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  side trade_side DEFAULT 'unknown',
  realized_pnl DECIMAL(20, 8) NOT NULL,
  fees DECIMAL(20, 8),
  roi DECIMAL(10, 4),
  result trade_result NOT NULL,
  needs_review BOOLEAN DEFAULT false,
  confidence_timestamp confidence_level DEFAULT 'medium',
  confidence_symbol confidence_level DEFAULT 'medium',
  confidence_pnl confidence_level DEFAULT 'medium',
  confidence_overall confidence_level DEFAULT 'medium',
  source_image_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_result ON trades(result);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on trades" ON trades
  FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON trades TO anon;
GRANT ALL ON trades TO authenticated;
```

### 3. Configure Environment Variables
Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── Charts.tsx      # Recharts visualizations
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── ImportExport.tsx# Data management
│   │   ├── KPICards.tsx    # Metric cards
│   │   ├── TradesTable.tsx # Trades table
│   │   └── WeekSelector.tsx# Week navigation
│   ├── layout/
│   │   └── Header.tsx      # App header
│   ├── ui/                 # Reusable UI components
│   └── upload/             # Screenshot upload components
│       ├── DropZone.tsx    # Drag & drop
│       ├── EditTradeModal.tsx
│       ├── ImagePreview.tsx
│       └── UploadSection.tsx
├── context/
│   └── TradesContext.tsx   # Global state management
├── hooks/
│   └── useOCR.ts           # OCR processing hook
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── trades-service.ts   # Database operations
├── types/
│   └── index.ts            # TypeScript types
└── utils/
    ├── dates.ts            # Date utilities
    ├── metrics.ts          # Analytics calculations
    ├── ocr.ts              # Tesseract.js wrapper
    ├── parsing.ts          # OCR text parsing
    ├── sampleData.ts       # Demo data
    └── storage.ts          # LocalStorage utilities
```

---

## Usage

### Import Screenshots
1. Click **"Import Screenshots"** tab
2. Drag & drop Bitget PnL screenshots
3. Review parsed data and correct any OCR errors
4. Trades are automatically saved

### View Analytics
1. Use the **week selector** to navigate between weeks
2. View KPIs, charts, and detailed trade history
3. Filter and sort trades in the table

### Demo Mode
Click **"Load Sample Data"** to populate 50 demo trades spanning 65+ days.

### Export Data
- **Export JSON:** Download all trades as JSON backup
- **Import JSON:** Restore from a previous backup
- **Share Summary:** Copy weekly performance summary to clipboard

---

## Deployment

### Netlify (Recommended)
1. Push to GitHub
2. Connect repo in Netlify Dashboard
3. Add environment variables for Supabase
4. Deploy

### Vercel
```bash
npm i -g vercel
vercel
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

MIT

---

## Author

Built with Claude Code
