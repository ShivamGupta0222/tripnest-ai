# OpenAI API Key Setup Instructions

## Local Development Setup

### Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy the generated API key

### Step 2: Add API Key to .env.local
1. Open the `.env.local` file in your project root
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Replace `sk-your-actual-api-key-here` with your actual API key
4. Save the file

### Step 3: Restart Development Server
```bash
# Stop the dev server (Ctrl+C)
# Then restart it
pnpm dev
```

The project will now have access to your OpenAI API key in backend API routes.

---

## Production Deployment (Vercel)

### Step 1: Add Environment Variable to Vercel
1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Click on your TripNest AI project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set the variable name: `OPENAI_API_KEY`
6. Paste your OpenAI API key as the value
7. Select which environments (Production, Preview, Development)
8. Click **Save**

### Step 2: Redeploy
- Vercel will automatically redeploy your project with the new environment variable
- Your backend API routes will now have access to the OpenAI API key

---

## Important Security Notes

✅ **Safe:**
- API key stored in `.env.local` (never committed to git)
- Environment variable `process.env.OPENAI_API_KEY` in backend routes only
- API key used securely in `/app/api/*` routes
- Frontend components cannot access the API key

❌ **NOT Safe:**
- Hardcoding API key in frontend code
- Exposing API key in client-side JavaScript
- Committing `.env.local` to version control

---

## Testing Your Setup

### Using the API Route
You can test the API endpoint in your code:

```javascript
// Frontend code - API key stays hidden
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
console.log(data);
```

The API key is only used server-side within `/app/api/generate-trip-title/route.ts`.

---

## Troubleshooting

**Issue:** "OPENAI_API_KEY is not set" warning during build
- **Solution:** Add your API key to `.env.local` for development or Vercel dashboard for production

**Issue:** 401 Unauthorized error from OpenAI API
- **Solution:** Check that your API key is correct and still valid in the OpenAI dashboard

**Issue:** API key visible in frontend code
- **Solution:** Never import `lib/openai.ts` in frontend components. Only use it in `/app/api/*` routes.

---

## File Reference

- `.env.local` - Your secret API key (local development)
- `lib/openai.ts` - Server-side utility to safely access the API key
- `/app/api/generate-trip-title/route.ts` - Example secure API route
- `.env.example` - Template showing required variables
- `.gitignore` - Already configured to ignore `.env.local`
