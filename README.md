## سامانه هوشمند آنالیز بدنی — باشگاه کاراته شرکت برق منطقه‌ای خراسان

Smart Karate Body Analytics System: Next.js (App Router) + TypeScript + Tailwind CSS,
with a Postgres/Prisma backend, Groq (Llama 3) AI analysis, and a branded Persian/RTL PDF report.

### Architecture

- **Dynamic Schema Registry** — `src/config/metrics.config.ts` is the single source of truth for
  all 25 Xiaomi S400 body metrics. The form, the AI prompt, and the PDF renderer all read from this
  array. The database stores metrics in a single `metrics` JSONB column (see `prisma/schema.prisma`),
  so adding/removing a metric never requires a migration or touching rendering code.
- **Separation of concerns**:
  - Data ingestion: `src/components/athlete-form.tsx` + `src/components/selfie-capture.tsx`
  - AI processing: `src/app/api/analyze/route.ts` (Groq SDK, server-side only)
  - Persistence: `src/app/api/athletes/route.ts` + `src/lib/prisma.ts`
  - Presentation: `src/components/pdf/report-document.tsx` + `src/app/api/pdf/route.tsx`

### Setup

1. **Install dependencies** (already run during scaffolding):
   ```bash
   npm install
   ```

2. **Configure environment variables** — copy `.env.example` to `.env` and fill in:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: a running PostgreSQL connection string.
   - `GROQ_API_KEY`: get a free key at https://console.groq.com — required for the AI analysis route.

3. **Create the database schema**:
   ```bash
   npx prisma migrate dev --name init
   ```
   (or `npx prisma db push` for a quick sync without migration history)

4. **Run the dev server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

### How it fits together

1. The coach fills in athlete info (name, gender, Jalali birthdate — age 10–50 computed automatically
   via `src/lib/jalali.ts`), captures a selfie with `react-webcam`, and enters the 25 metrics from the
   Xiaomi S400 scan. Inputs are generated dynamically from `metrics.config.ts` — no hardcoded fields.
2. On submit, the payload is sent to `/api/analyze`, which builds a Persian prompt instructing Groq's
   Llama 3 model to act as an elite Karate conditioning coach and return a structured Persian report
   (general analysis, strengths, areas to improve, 4-week action plan).
3. Once the AI report is back, "دانلود گزارش PDF" calls `/api/pdf`, which renders
   `report-document.tsx` with `@react-pdf/renderer` — branded header, selfie, the 25 metrics in a
   dynamically-mapped grid, and the AI analysis — and streams back a downloadable PDF.
4. (Optional) `POST /api/athletes` persists the athlete + assessment to Postgres via Prisma for
   historical tracking across sessions.

### Adding a new metric later

Add one entry to the `METRICS_CONFIG` array in `src/config/metrics.config.ts` — it automatically
appears in the form, the Groq prompt, the PDF grid, and zod validation. No other file changes needed.
# karate-analysis-c
