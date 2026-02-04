# Alphagems Nationalities

A single-page interactive website to collect and visualize Discord community member nationalities in real-time.

## Features

- Country selection with searchable dropdown (195 countries with flags)
- Optional display name input
- Real-time bar and pie chart visualization
- Live updates via Supabase Realtime
- Rate limiting (1 submission per minute per session)
- Mobile responsive design
- Dark mode with glassmorphism UI
- Analytics tracking (GA4 + PostHog)

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (recommended)
- **Analytics:** Google Analytics 4, PostHog

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the following SQL:

```sql
-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(24),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(64)
);

-- Create index for faster queries
CREATE INDEX idx_submissions_country_code ON submissions(country_code);
CREATE INDEX idx_submissions_session_id ON submissions(session_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Create view for aggregated country counts
CREATE VIEW country_counts AS
SELECT
  country_code,
  country_name,
  COUNT(*)::INTEGER as count
FROM submissions
GROUP BY country_code, country_name
ORDER BY count DESC;

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for stats)
CREATE POLICY "Allow public read" ON submissions
  FOR SELECT USING (true);

-- Allow anyone to insert (for submissions)
CREATE POLICY "Allow public insert" ON submissions
  FOR INSERT WITH CHECK (true);

-- Enable Realtime for the submissions table
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
```

4. Go to **Project Settings** -> **API** and copy:
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional (for analytics):
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4 Measurement ID
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (default: https://app.posthog.com)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── submit/route.ts    # POST submission handler
│   │   └── stats/route.ts     # GET aggregated stats
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with meta/analytics
│   └── page.tsx               # Main page component
├── components/
│   ├── BarChartViz.tsx        # Bar chart visualization
│   ├── PieChartViz.tsx        # Pie chart visualization
│   ├── ChartToggle.tsx        # Toggle between charts
│   ├── GlassCard.tsx          # Glassmorphism card component
│   └── SubmissionForm.tsx     # Country select + name form
├── lib/
│   ├── analytics.ts           # GA4 + PostHog helpers
│   ├── countries.ts           # ISO country list with flags
│   └── supabase.ts            # Supabase client
└── types/
    └── index.ts               # TypeScript types
```

## License

MIT
