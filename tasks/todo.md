# Bitget PnL Crypto Tracker - Implementation Plan

## Project Overview
Build a production-ready web app to track trading performance from Bitget PnL screenshots using OCR.

## Tech Stack
- Next.js 14 with TypeScript
- Tailwind CSS
- Tesseract.js (client-side OCR)
- Recharts (charts)
- @tanstack/react-table (tables)
- date-fns (date handling)
- localStorage (persistence)

---

## Phase 1: Project Setup
- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS with dark mode
- [x] Install dependencies (tesseract.js, recharts, @tanstack/react-table, date-fns)
- [x] Set up project structure (components, hooks, utils, types)

## Phase 2: Core Types & Utilities
- [x] Define TypeScript types for trades, weekly metrics, OCR results
- [x] Create localStorage utility functions (save, load, export, import)
- [x] Create date utilities for ISO week calculations
- [x] Create metrics calculation utilities (win rate, profit factor, etc.)

## Phase 3: OCR Pipeline
- [x] Set up Tesseract.js worker
- [x] Create OCR processing hook with progress tracking
- [x] Build parsing logic with keyword anchors and regex patterns
- [x] Create confidence scoring system
- [x] Build mapping config for extensible parsing rules

## Phase 4: Screenshot Import UI
- [x] Create drag & drop upload component
- [x] Build preview thumbnails component
- [x] Create OCR progress indicator
- [x] Build parsed record editor modal
- [x] Implement duplicate detection logic

## Phase 5: Data Management
- [x] Create trades context/store
- [x] Build data validation utilities
- [x] Implement merge/skip duplicate handling
- [x] Create "Needs Review" flagging system

## Phase 6: Analytics Dashboard
- [x] Build week selector component
- [x] Create KPI cards (Net PnL, Win Rate, Total Trades, etc.)
- [x] Build weekly Net PnL line chart
- [x] Build Win/Loss count bar chart
- [x] Build cumulative equity curve chart

## Phase 7: Trades Table
- [x] Set up @tanstack/react-table
- [x] Implement sorting and filtering
- [x] Add status badges (Win/Loss/Needs Review)
- [x] Add row actions (edit, delete)

## Phase 8: Import/Export
- [x] Export all data to JSON
- [x] Import JSON to restore
- [x] Create shareable summary text block

## Phase 9: Sample Data & Demo Mode
- [x] Create mocked OCR text samples
- [x] Build demo mode toggle (Load Sample Data button)
- [x] Add sample screenshots mode

## Phase 10: Polish & UX
- [x] Finalize dark mode styling
- [x] Add loading states
- [x] Add error handling UI
- [x] Final testing and cleanup

---

## Review Section

### Summary of Implementation

The Bitget PnL Crypto Tracker has been fully implemented with all required features:

#### Core Features Delivered:
1. **Screenshot Import Pipeline**
   - Drag & drop upload with react-dropzone
   - Preview thumbnails with status indicators
   - Tesseract.js OCR with progress tracking
   - Robust parsing with keyword anchors and regex patterns
   - Confidence scoring (high/medium/low) per field
   - Edit parsed record modal for OCR corrections

2. **Data Validation**
   - Duplicate detection based on timestamp + symbol + PnL
   - Merge/skip/add options for duplicates
   - Numeric format handling
   - "Needs Review" flagging for low-confidence extractions

3. **Weekly Analytics Dashboard**
   - ISO week selector with navigation
   - 8 KPI cards: Net PnL, Win Rate, Total Trades, Avg Win, Avg Loss, Profit Factor, Max Drawdown, Best Day
   - Weekly Net PnL area chart (last 12 weeks)
   - Win/Loss distribution bar chart
   - Cumulative equity curve line chart

4. **Trades Table**
   - Full sorting and filtering with @tanstack/react-table
   - Search by symbol
   - Filter by result (Win/Loss/Needs Review)
   - Pagination
   - Inline edit and delete actions

5. **Import/Export**
   - Export all data to JSON
   - Import JSON to restore data
   - Shareable summary text block
   - Load Sample Data button for demo mode
   - Clear All with confirmation

6. **UX/Design**
   - Dark mode by default
   - Modern "trader tool" aesthetic
   - Responsive design
   - Loading states and progress indicators
   - Error handling with clear messaging

#### File Structure:
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── Charts.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EditTradeTableModal.tsx
│   │   ├── ImportExport.tsx
│   │   ├── KPICards.tsx
│   │   ├── TradesTable.tsx
│   │   └── WeekSelector.tsx
│   ├── layout/
│   │   └── Header.tsx
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── index.ts
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Select.tsx
│   └── upload/
│       ├── DropZone.tsx
│       ├── EditTradeModal.tsx
│       ├── ImagePreview.tsx
│       └── UploadSection.tsx
├── context/
│   └── TradesContext.tsx
├── hooks/
│   └── useOCR.ts
├── types/
│   └── index.ts
└── utils/
    ├── dates.ts
    ├── metrics.ts
    ├── ocr.ts
    ├── parsing.ts
    ├── sampleData.ts
    └── storage.ts
```

#### Known Limitations:
- OCR accuracy depends on screenshot quality and format
- First OCR run may be slow due to Tesseract.js initialization
- Only English language OCR is currently supported

#### Future Enhancements (Optional):
- PDF export for weekly reports
- Multiple language support for OCR
- Cloud sync option
- More chart types and analytics
