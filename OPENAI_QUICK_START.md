# OpenAI Integration - Quick Start

## TL;DR - Get Started in 3 Steps

### 1. Get API Key
Visit https://platform.openai.com/api-keys and create a new secret key

### 2. Configure Locally
```bash
cp .env.example .env.local
# Edit .env.local and add your API key
OPENAI_API_KEY=sk_your_actual_key_here
```

### 3. Test It
```bash
pnpm dev
# Visit: http://localhost:3000/api/generate-trip-title
```

You should see: `"openaiConfigured": true`

---

## For Vercel Deployment

1. Dashboard → Project → Settings → Environment Variables
2. Add: `OPENAI_API_KEY` = `sk_your_actual_key_here`
3. Select all environments (Production, Preview, Development)
4. Save and redeploy

---

## Key Files

| File | Purpose |
|------|---------|
| `.env.example` | Instructions + placeholder |
| `lib/openai.ts` | Get API key safely on server |
| `app/api/generate-trip-title/route.ts` | Example secure API route |
| `OPENAI_SETUP.md` | Complete setup guide |

---

## Safe Usage Pattern

```typescript
// ✅ CORRECT - Backend API Route (/app/api/*)
import { getOpenAIApiKey } from '@/lib/openai';

export async function POST(request: Request) {
  const apiKey = getOpenAIApiKey(); // ✓ Server-side only
  // Use apiKey with OpenAI API...
}
```

```typescript
// ❌ WRONG - Frontend Component
// NEVER do this:
const apiKey = process.env.OPENAI_API_KEY; // ❌ Exposed to browser!
// Use fetch('/api/your-endpoint') instead
```

---

## Environment Variables Reference

| Variable | Where Set | Used In | Scope |
|----------|-----------|---------|-------|
| `OPENAI_API_KEY` | `.env.local` or Vercel dashboard | Backend API routes only | Server-side |

---

## Testing the API

```bash
# Test if configured
curl http://localhost:3000/api/generate-trip-title

# Test with data (POST)
curl -X POST http://localhost:3000/api/generate-trip-title \
  -H "Content-Type: application/json" \
  -d '{"destination":"Goa","style":"adventure","budget":"₹15000"}'
```

---

## Next Steps

1. ✅ Configure `OPENAI_API_KEY`
2. ✅ Test the sample endpoint
3. 📝 Create your own API routes in `/app/api/*`
4. 🔗 Call them from frontend components safely
5. 🚀 Deploy to Vercel with env vars set

For detailed setup, see `OPENAI_SETUP.md`
