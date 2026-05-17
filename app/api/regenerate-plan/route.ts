import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

interface TripFormPayload {
  fromCity: string;
  destination: string;
  budget: number;
  travelers: number;
  days: number;
  dates?: string;
  travelWith: string;
  vibe: string[];
  budgetStyle: string;
  transportPreference: string;
}

export interface RegeneratedTripPlan {
  title: string;
  description: string;
  estimatedRange: string;
  bestFor: string;
  stayStyle: string;
  transportStyle: string;
  dailyPlan: string[];
  highlights: string[];
  budgetNote: string;
}

interface RegenerateRequestBody {
  tripFormData: TripFormPayload;
  planTierIndex: number;
  currentPlanTitle: string;
  currentDescription: string;
  customizedDailyPlan: string[];
  customizedHighlights: string[];
  currentEstimatedRange: string;
  currentStayStyle: string;
  currentTransportStyle: string;
  currentBudgetNote: string;
}

function buildRegeneratePrompt(b: RegenerateRequestBody): string {
  const d = b.tripFormData;

  const vibe = Array.isArray(d.vibe)
    ? d.vibe.join(', ')
    : '';

  const customizedItinerary = b.customizedDailyPlan
    .map((line, i) => `${i + 1}. ${line}`)
    .join('\n');

  const highlightsBlock =
    b.customizedHighlights.length > 0
      ? b.customizedHighlights
          .map((h, i) => `${i + 1}. ${h}`)
          .join('\n')
      : '(none)';

  const tierHint =
    b.planTierIndex === 0
      ? 'Budget-saver tier: local experiences, shared transport, budget stays.'
      : b.planTierIndex === 2
        ? 'Premium tier: boutique stays, curated cafes, comfort-first travel.'
        : 'Smart comfort tier: balanced comfort and experiences.';

  return `You are TripNest AI.

Regenerate EXACTLY ONE highly personalized trip plan.

TRIP CONTEXT:
- Route: ${d.fromCity} → ${d.destination}
- Group Budget: ₹${d.budget.toLocaleString('en-IN')}
- Travelers: ${d.travelers}
- Days: ${d.days}
- Travel group type: ${d.travelWith}
- Vibes: ${vibe}
- Budget philosophy: ${d.budgetStyle}
- Transport preference: ${d.transportPreference}

PLAN PERSONALITY:
${tierHint}

USER CUSTOMIZED ITINERARY:
${customizedItinerary}

CURRENT HIGHLIGHTS:
${highlightsBlock}

IMPORTANT PERSONALIZATION RULES:
- Solo travelers:
  prioritize flexibility, peaceful exploration, local culture, safe movement, cafes, scenic reflection spots, and self-paced activities.

- Couples:
  prioritize romantic cafes, sunset spots, aesthetic stays, cozy dinners, scenic experiences, slow moments, and intimate activities.

- Friends groups:
  prioritize energetic activities, nightlife, social experiences, adventure, group fun, shared transport, and memorable high-energy moments.

- Families:
  prioritize safety, comfort, kid-friendly or parent-friendly attractions, smoother pacing, practical transport, relaxed sightseeing, and family-oriented stays.
- The regenerated plan MUST feel unique to this vibe combination.
- Different vibe combinations should create noticeably different experiences.
- Adventure vibe should prioritize trekking, rafting, hidden exploration, active schedules.
- Relaxed vibe should prioritize cafes, sunsets, scenic breaks, slower pacing.
- Party vibe should prioritize nightlife, beach clubs, social energy, late evenings.
- Nature vibe should prioritize scenic viewpoints, forests, waterfalls, peaceful experiences.
- Luxury vibe should prioritize boutique stays, premium dining, private movement, curated experiences.
- Cafe vibe should prioritize aesthetic cafes, slow mornings, food culture.
- Mixed vibes should intelligently combine all selected moods.

ANTI-REPETITION RULES:
- Avoid generating the exact same cafes, beaches, viewpoints, markets, or activities repeatedly.
- Avoid generic repetitive itineraries.
- Do not copy template-style plans.
- Make the trip FEEL handcrafted for this user.

OUTPUT RULES:
1. Output ONLY JSON.
2. Use this shape:
{
  "plan": {
    "title": "",
    "description": "",
    "estimatedRange": "",
    "bestFor": "",
    "stayStyle": "",
    "transportStyle": "",
    "dailyPlan": [],
    "highlights": [],
    "budgetNote": ""
  }
}
3. dailyPlan length must not exceed ${d.days}.
4. estimatedRange must be realistic for Indian domestic travel.
5. Keep all pricing as TOTAL GROUP COST, never per-person.
6. highlights max 6.
7. Every regenerated plan should FEEL personalized and dynamic.`;
}

function parseRegeneratedPlan(
  text: string
): RegeneratedTripPlan | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      plan?: RegeneratedTripPlan;
    };

    const plan = parsed.plan;

    if (!plan || typeof plan !== 'object') {
      return null;
    }

    return {
      title: plan.title || 'Trip Plan',
      description: plan.description || 'Personalized experience',
      estimatedRange:
        plan.estimatedRange || 'Flexible group estimate',
      bestFor: plan.bestFor || 'Your group',
      stayStyle: plan.stayStyle || 'Comfortable stays',
      transportStyle:
        plan.transportStyle || 'Practical transport',
      dailyPlan: Array.isArray(plan.dailyPlan)
        ? plan.dailyPlan
        : [],
      highlights: Array.isArray(plan.highlights)
        ? plan.highlights.slice(0, 6)
        : [],
      budgetNote:
        plan.budgetNote ||
        'Group-total estimate — confirm live rates before booking',
    };
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body =
      (await request.json()) as RegenerateRequestBody;

    if (
      !body.tripFormData?.fromCity ||
      !body.tripFormData?.destination
    ) {
      return NextResponse.json(
        {
          error:
            'tripFormData with fromCity and destination is required',
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.customizedDailyPlan) ||
      body.customizedDailyPlan.length === 0
    ) {
      return NextResponse.json(
        { error: 'customizedDailyPlan is required' },
        { status: 400 }
      );
    }

    const prompt = buildRegeneratePrompt(body);

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    const plan = parseRegeneratedPlan(text);

    if (!plan) {
      return NextResponse.json(
        {
          error:
            'Could not parse regenerated plan from AI response',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { plan },
      { status: 200 }
    );
  } catch (error) {
    console.error('[regenerate-plan] Error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to regenerate plan';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
