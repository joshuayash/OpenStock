# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Building
npm run build        # Production build with Turbopack
npm run start        # Run production server

# Testing
npm run test         # Run all tests once (vitest)
npm run test:watch   # Run tests in watch mode
npm run test:db      # Test MongoDB connectivity

# Linting
npm run lint         # ESLint check

# Inngest (workflows/cron) - run in separate terminal
npx inngest-cli@latest dev
```

## Architecture Overview

**Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, MongoDB, Better Auth, Inngest

### Route Groups
- `(auth)/` - Authentication pages (sign-in, sign-up) with centered layout
- `(root)/` - Main application pages with Header/Footer layout

### Key Patterns

**Server Actions**: All mutations go through Server Actions in `lib/actions/`:
- `auth.ts` - Better Auth handlers
- `finnhub.ts` - Market data fetching with caching
- `user.ts` - User onboarding data
- `watchlist.ts` - Watchlist CRUD operations
- `alerts.ts` - Price alerts

**Data Fetching Strategy**:
- Server Components fetch directly using `lib/actions/finnhub.ts`
- Uses React `cache()` for memoization within request
- Finnhub API has tiered caching (0s for real-time data, 24h for profiles)

**Authentication**:
- Better Auth with MongoDB adapter
- Protected routes enforced via `middleware.ts`
- Public routes: `/sign-in`, `/sign-up`, static assets

**Background Jobs (Inngest)**:
- `app/user.created` → AI-personalized welcome email
- Cron every 15 min → Stock price alerts
- Cron Monday 9AM → Weekly news summary emails

### Database Models

**Watchlist** (`database/models/watchlist.model.ts`):
- `userId` + `symbol` unique constraint per user
- Stores symbol, company name, exchange

**Alert** (`database/models/alert.model.ts`):
- Price threshold alerts with active/inactive state
- Supports multiple conditions (above/below)

### External APIs

**Finnhub** (`lib/actions/finnhub.ts`):
- Stock search, quotes, company profiles, market news
- Requires `NEXT_PUBLIC_FINNHUB_API_KEY`

**TradingView** (`lib/constants.ts`):
- Embeddable widgets for charts, heatmaps, market overview
- Symbol mappings for different exchanges in `TRADINGVIEW_EXCHANGE_MAPPINGS`

**Adanos** (optional, `lib/actions/adanos.ts`):
- Sentiment analysis across Reddit, X.com, news, Polymarket
- Requires `ADANOS_API_KEY`

### AI Provider Abstraction

`lib/ai-provider.ts` provides multi-provider AI with fallback:
- Primary: Google Gemini
- Fallbacks: MiniMax, Siray.ai
- Uses `AI_PROVIDER` env var (default: "gemini")

### UI Components

- **shadcn/ui** components in `components/ui/` (New York style, slate base)
- **Command palette** (`components/SearchCommand.tsx`) - Cmd+K global search
- **Forms** use `react-hook-form` with custom field components in `components/forms/`

### Environment Variables

Core required:
```bash
NODE_ENV=development
MONGODB_URI=mongodb://root:example@mongodb:27017/openstock?authSource=admin  # or Atlas
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key
FINNHUB_BASE_URL=https://finnhub.io/api/v1
GEMINI_API_KEY=your_gemini_key  # for AI emails
NODEMAILER_EMAIL=youraddress@gmail.com
NODEMAILER_PASSWORD=your_gmail_app_password
INNGEST_SIGNING_KEY=your_inngest_key  # for Vercel deployment
```

### Docker Setup

```bash
# Start MongoDB and app
docker compose up -d mongodb && docker compose up -d --build
```

### Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)

### Testing

Vitest configuration in `vitest.config.ts`. Tests in `__tests__/` directory.

### License

AGPL-3.0 - Any modifications, redistribution, or deployment as a web service must release source code under the same license.
