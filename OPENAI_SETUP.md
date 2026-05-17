# OpenAI API Configuration Guide

This guide explains how to securely configure OpenAI API for the TripNest AI project.

## Security Overview

- **API Key Location**: `process.env.OPENAI_API_KEY` (server-side only)
- **Frontend Protection**: Never exposed to client-side code
- **Server-only Usage**: Only accessible in API routes (`/app/api/*`)
- **Environment Variable**: Set in `.env.local` (dev) or Vercel dashboard (production)

## Local Development Setup

### Step 1: Get Your OpenAI API Key

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the generated key (starts with `sk_...`)

### Step 2: Configure Local Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder:
   ```env
   # Before:
   OPENAI_API_KEY=sk_your_actual_api_key_here
   
   # After:
   OPENAI_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. Save the file (it's in `.gitignore` and won't be committed)

### Step 3: Verify Configuration

Start the dev server and test the API endpoint:

```bash
pnpm dev
```

Then visit:
```
http://localhost:3000/api/generate-trip-title
```

You should see:
```json
{
  "status": "ok",
  "openaiConfigured": true,
  "message": "Use POST method to generate trip titles"
}
```

## Vercel Deployment Setup

### Step 1: Add Environment Variable

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**

### Step 2: Configure the Variable

- **Name**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key (starts with `sk_...`)
- **Environment**: Select all three (Production, Preview, Development)

### Step 3: Deploy

1. Click **Save**
2. Go to **Deployments**
3. Redeploy your project (or push to your Git branch)

The API key will automatically be available in your deployed functions.

## Using OpenAI in Your API Routes

### Example: Secure Backend Usage

```typescript
// /app/api/your-endpoint/route.ts

import { getOpenAIApiKey } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    // Get API key (only works on server)
    const apiKey = getOpenAIApiKey();

    // Use with OpenAI library or direct API calls
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ ... })
    // });

    return new Response(JSON.stringify({ result: '...' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Example: Call from Frontend

```typescript
// components/trip-form.tsx (Frontend - SAFE)

export async function callTripTitleAPI() {
  const response = await fetch('/api/generate-trip-title', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination: 'Goa',
      style: 'adventure',
      budget: '₹15000'
    })
  });

  const data = await response.json();
  return data.title;
}
```

The API key is **never sent to the browser** - it stays on the server!

## Troubleshooting

### Error: "OPENAI_API_KEY is not configured"

**Local Development:**
- Check that `.env.local` exists in the project root
- Verify the correct API key is pasted (starts with `sk_`)
- Restart the dev server after adding the key

**Vercel Deployment:**
- Go to Settings → Environment Variables
- Verify `OPENAI_API_KEY` is set
- Check that it's enabled for all environments (Production, Preview, Development)
- Redeploy the project after adding the variable

### Error: "Invalid API key"

- Make sure you copied the entire key (including the `sk_` prefix)
- No extra spaces or quotes
- Key hasn't been revoked from the OpenAI dashboard

### How to Check Logs

**Vercel Logs:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the recent deployment
3. Click "Runtime Logs" to see server-side errors
4. API keys are automatically redacted from logs

## Files

- **`.env.example`** - Template with setup instructions
- **`lib/openai.ts`** - Secure API key configuration utility
- **`app/api/generate-trip-title/route.ts`** - Example API route

## Best Practices

✅ **DO:**
- Store API key in environment variables
- Use API key only in backend API routes
- Handle errors gracefully
- Keep API key secret and never commit it

❌ **DON'T:**
- Never put API key in frontend code
- Never commit `.env.local` to Git
- Never expose API key in error messages to users
- Never log the API key

## Next Steps

1. Configure your API key (see steps above)
2. Test the sample endpoint: `/api/generate-trip-title`
3. Implement your OpenAI calls in API routes
4. Update frontend components to call your API endpoints
5. Deploy to Vercel with environment variables set

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
