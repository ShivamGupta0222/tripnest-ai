# OpenRouter Setup Checklist

## Quick Setup (5 minutes)

### Step 1: Get OpenRouter API Key
- [ ] Visit https://openrouter.ai
- [ ] Sign up for free account (or login)
- [ ] Go to Keys → Create new key
- [ ] Copy the API key

### Step 2: Local Development
- [ ] Open `.env.local` file
- [ ] Add: `OPENAI_API_KEY=your_key_here`
- [ ] Save the file
- [ ] Run: `pnpm dev`

### Step 3: Test Locally
- [ ] Open http://localhost:3000/home
- [ ] Scroll to "Plan Your Trip" section
- [ ] Fill in trip details:
  - From: Mumbai
  - Destination: Goa
  - Budget: 50000
  - Days: 5
  - Select travel preferences
- [ ] Click "Generate My Personalized Trip"
- [ ] Wait for AI to process (3-8 seconds)
- [ ] Verify trip plans appear on results page

### Step 4: Vercel Deployment
- [ ] Go to Vercel dashboard
- [ ] Select your project
- [ ] Go to Settings → Environment Variables
- [ ] Click "Add New"
- [ ] Name: `OPENAI_API_KEY`
- [ ] Value: Paste your OpenRouter API key
- [ ] Click "Save and Deploy"
- [ ] Wait for deployment to complete

### Step 5: Test Production
- [ ] Visit your deployed URL
- [ ] Scroll to trip planning form
- [ ] Generate a trip plan
- [ ] Verify results display correctly

## Verify Integration

### Check API Endpoint
```bash
# Local
curl http://localhost:3000/api/generate-trip

# Response should be:
# {"status":"ok","message":"Trip generation API is ready",...}
```

### Check Logs
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Check Network tab for `/api/generate-trip` requests
- [ ] Verify successful response (200 status)

## Troubleshooting

### "OPENAI_API_KEY is not configured"
- [ ] Check `.env.local` file exists
- [ ] Check key is correctly formatted
- [ ] Restart dev server: `pnpm dev`
- [ ] For Vercel: Check environment variables in dashboard

### "Authentication failed"
- [ ] Verify API key is correct
- [ ] Check key hasn't been revoked
- [ ] Visit https://openrouter.ai/keys to confirm

### "Network Error"
- [ ] Check internet connection
- [ ] Try refreshing the page
- [ ] Check OpenRouter status: https://status.openrouter.ai
- [ ] Try a different destination

### No Results
- [ ] Check browser console for errors
- [ ] Verify API key has credits
- [ ] Try simpler destination (e.g., "Delhi" → "Goa")
- [ ] Check `/api/generate-trip` response in Network tab

## File Locations

### Configuration
- `lib/openai.ts` - OpenRouter config (base URL, model)
- `.env.local` - Local API key (not in git)
- `.env.example` - Template for environment variables

### Backend
- `app/api/generate-trip/route.ts` - Main API endpoint

### Frontend
- `components/trip-form.tsx` - Form submission logic
- `app/results/page.tsx` - Results display

### Documentation
- `OPENROUTER_INTEGRATION.md` - Detailed integration guide
- `OPENROUTER_SETUP_CHECKLIST.md` - This file

## Important Notes

- API key is **private** - never share or commit it
- `.env.local` is in `.gitignore` - won't be committed
- Free tier has rate limits - space out requests
- sessionStorage data is cleared when browser closes
- No data is stored permanently

## Next Steps

Once setup is complete:

1. **Test thoroughly** - Try different destinations and preferences
2. **Monitor usage** - Check OpenRouter dashboard for API calls
3. **Collect feedback** - Improve trip generation based on user experience
4. **Scale up** - Consider upgrading OpenRouter plan if needed

## Support Resources

- OpenRouter Docs: https://openrouter.ai/docs
- API Status: https://status.openrouter.ai
- Community: https://openrouter.ai/forum

---

**Last Updated**: 2024
**Status**: Production Ready
