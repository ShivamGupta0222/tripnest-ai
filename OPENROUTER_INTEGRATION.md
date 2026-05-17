# OpenRouter Integration Guide

## Overview

TripNest AI now uses OpenRouter to generate personalized trip plans via AI. This guide explains the setup, configuration, and how the system works.

## Architecture

### Backend Flow
```
Trip Form (Frontend)
    ↓
POST /api/generate-trip
    ↓
OpenRouter API (via OpenAI SDK)
    ↓
AI Response Processing
    ↓
Structured Trip Plans (JSON)
    ↓
sessionStorage (Frontend)
    ↓
Results Page Display
```

## Configuration

### 1. Environment Setup

The project uses `process.env.OPENAI_API_KEY` as configured in `lib/openai.ts`:

```typescript
const OPENROUTER_CONFIG = {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'deepseek/deepseek-r1-0528:free',
};
```

### 2. Getting an API Key

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Go to Keys → Create key
4. Copy your API key

### 3. Local Development Setup

Add your API key to `.env.local`:

```bash
OPENAI_API_KEY=your_openrouter_api_key_here
```

### 4. Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenRouter API key
4. Deploy

## API Endpoint

### POST /api/generate-trip

Generates 3 personalized trip plans based on user input.

#### Request Body

```json
{
  "from": "Mumbai",
  "destination": "Goa",
  "budget": 50000,
  "travelers": 2,
  "days": 5,
  "dates": "2024-06-15",
  "travelWith": "couple",
  "vibe": ["adventure", "relaxed", "beach"],
  "budgetStyle": "balanced",
  "transportPreference": "fastest"
}
```

#### Response

```json
{
  "success": true,
  "plans": {
    "budgetSaver": {
      "type": "Budget Saver",
      "description": "...",
      "highlights": ["..."],
      "estimatedCost": "₹...",
      "itinerary": [
        {
          "day": 1,
          "title": "Arrival in Goa",
          "activities": ["..."]
        }
      ]
    },
    "smartComfort": { ... },
    "premiumExperience": { ... }
  }
}
```

## Frontend Integration

### TripForm Component

The form collects user preferences and calls the API:

```typescript
const handleGenerateTrip = async () => {
  const tripData = {
    from: formData.from,
    destination: formData.destination,
    budget: formData.budget,
    travelers: formData.travelers,
    days: formData.days,
    dates: formData.dates,
    travelWith: formData.travelWith,
    vibe: selectedVibes,
    budgetStyle: formData.budgetStyle,
    transportPreference: formData.transport,
  };

  const response = await fetch('/api/generate-trip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData),
  });

  const result = await response.json();
  
  // Store plans in sessionStorage
  sessionStorage.setItem('generatedTrips', JSON.stringify(result.plans));
  sessionStorage.setItem('tripFormData', JSON.stringify(tripData));
  
  // Navigate to results
  router.push('/results');
};
```

### Results Page

Displays the AI-generated trip plans:

```typescript
useEffect(() => {
  const generatedTrips = JSON.parse(
    sessionStorage.getItem('generatedTrips') || '{}'
  );
  
  // Transform and display plans
  const plans = [
    transformTripPlan(generatedTrips.budgetSaver, ...),
    transformTripPlan(generatedTrips.smartComfort, ...),
    transformTripPlan(generatedTrips.premiumExperience, ...),
  ];
  
  setItineraries(plans);
}, []);
```

## Security

### Backend Only

- API key is **never** exposed in frontend code
- Only accessible in `/app/api/*` routes
- Environment variable is server-side only
- Never logged in client-side code

### Data Privacy

- Trip form data is stored in `sessionStorage` (client-side only)
- No data is persisted to database
- User preferences are not saved
- All data is cleared when the session ends

## Model Information

**Model**: `deepseek/deepseek-chat-v3-0324:free`

- Free tier available on OpenRouter
- Fast response times
- Good for travel planning tasks
- Supports structured JSON output

## Troubleshooting

### API Key Not Found

```
Error: OPENAI_API_KEY is not configured
```

**Solution**: Add your API key to `.env.local` or Vercel environment variables.

### Invalid API Key

```
Error: Authentication failed
```

**Solution**: Verify your OpenRouter API key is correct at [https://openrouter.ai/keys](https://openrouter.ai/keys)

### Rate Limited

```
Error: Rate limit exceeded
```

**Solution**: OpenRouter free tier has rate limits. Wait a few moments and try again.

### No Response from AI

Check the `/api/generate-trip` endpoint:

```bash
# Local development
curl -X GET http://localhost:3000/api/generate-trip
```

## Performance

- Average response time: 3-8 seconds
- Timeout: 30 seconds
- Fallback: Default itineraries if API fails

## Future Improvements

1. Add caching for similar requests
2. Store user trips in database
3. Add trip sharing via URL
4. Include real pricing from travel APIs
5. Support more destinations
6. Multi-language trip generation

## Support

For issues with OpenRouter:
- Docs: [https://openrouter.ai/docs](https://openrouter.ai/docs)
- Status: [https://status.openrouter.ai](https://status.openrouter.ai)

For issues with this integration:
- Check `app/api/generate-trip/route.ts`
- Review `lib/openai.ts` configuration
- Check console logs in browser DevTools
