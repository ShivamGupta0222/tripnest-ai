import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

interface TripRequest {
  fromCity: string;
  destination: string;
  budget: number;
  travelers: number;
  days: number;
  dates: string;
  travelWith: string;
  vibe: string[];
  budgetStyle: string;
  transportPreference: string;
}

interface TripPlan {
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

const destinationBudgetRules = [
  { keys: ['shimla', 'शिमला'], name: 'Shimla', minPerPersonPerDay: 1800 },
  {
    keys: ['mussoorie', 'masoori', 'मसूरी'],
    name: 'Mussoorie',
    minPerPersonPerDay: 1600,
  },
  { keys: ['manali', 'मनाली'], name: 'Manali', minPerPersonPerDay: 2200 },
  {
    keys: [
      'haridwar',
      'rishikesh',
      'haridwar-rishikesh',
      'हरिद्वार',
      'ऋषिकेश',
    ],
    name: 'Haridwar & Rishikesh',
    minPerPersonPerDay: 1400,
  },
  { keys: ['goa', 'गोवा'], name: 'Goa', minPerPersonPerDay: 2200 },
  {
    keys: [
      'mcleodganj',
      'mc leod ganj',
      'mcleod ganj',
      'maclodganj',
      'dharamshala',
      'मैक्लॉडगंज',
    ],
    name: 'McLeodganj',
    minPerPersonPerDay: 1800,
  },
  { keys: ['udaipur', 'उदयपुर'], name: 'Udaipur', minPerPersonPerDay: 1800 },
];

function getDestinationBudgetRule(destination: string) {
  const cleanDestination = destination.trim().toLowerCase();

  return destinationBudgetRules.find((rule) =>
    rule.keys.some((key) => cleanDestination.includes(key))
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as TripRequest;

    if (!body.fromCity || !body.destination) {
      return NextResponse.json(
        { error: 'Missing required fields: fromCity and destination' },
        { status: 400 }
      );
    }

    const destinationRule = getDestinationBudgetRule(body.destination);

    if (!destinationRule) {
      return NextResponse.json(
        {
          error:
            'Currently TripNest AI supports only Shimla, Mussoorie, Manali, Haridwar-Rishikesh, Goa, McLeodganj, and Udaipur.',
        },
        { status: 400 }
      );
    }

    const minimumRequiredBudget =
      destinationRule.minPerPersonPerDay * body.travelers * body.days;

    if (body.budget < minimumRequiredBudget) {
      return NextResponse.json(
        {
          code: 'BUDGET_TOO_LOW',
          error: 'Budget too low for this trip.',
          budgetWarning: {
            destinationName: destinationRule.name,
            minimumRequiredBudget,
            enteredBudget: body.budget,
            travelers: body.travelers,
            days: body.days,
            minPerPersonPerDay: destinationRule.minPerPersonPerDay,
          },
        },
        { status: 400 }
      );
    }

    const prompt = buildTripPrompt(body, minimumRequiredBudget);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const plans = parseTripPlans(text);

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error('[generate-trip] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate trip plans';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function buildTripPrompt(
  data: TripRequest,
  minimumRequiredBudget: number
): string {
  const vibeText = data.vibe.join(', ');
  const groupBudget = data.budget;
  const groupBudgetLabel = `₹${groupBudget.toLocaleString('en-IN')}`;
  const perGroupPerDayHint = Math.round(groupBudget / Math.max(data.days, 1));
  const generationSeed = `${data.destination}-${data.fromCity}-${data.travelWith}-${data.vibe.join('-')}-${data.budgetStyle}-${data.transportPreference}-${data.days}-${Date.now()}`;

  const budgetSaverMin = minimumRequiredBudget;
  const budgetSaverMax = Math.max(groupBudget, minimumRequiredBudget);

  const smartComfortMin = groupBudget;
  const smartComfortMax = Math.round(groupBudget * 1.2);

  const premiumMin = Math.round(groupBudget * 1.25);
  const premiumMax = Math.round(groupBudget * 1.6);

  const vibePersonality = buildVibePersonality(data);
  const destinationFlavor = buildDestinationFlavor(data.destination);

  return `You are TripNest AI, a highly personalized travel planner for Indian travelers.
Your job is to generate plans that feel made specifically for THIS user, not copied from a template.
Generate exactly 3 distinct trip plans.

TRIP REQUEST:
- Origin: ${data.fromCity}
- Destination: ${data.destination}
- Travel date: ${data.dates}
- GROUP TOTAL BUDGET: ${groupBudgetLabel} for ${data.days} days
- Travelers: ${data.travelers}
- Group budget per day scale: ~₹${perGroupPerDayHint.toLocaleString('en-IN')}
- Party type: ${data.travelWith}
- Selected vibes: ${vibeText}
- Budget philosophy: ${data.budgetStyle}
- Transport preference: ${data.transportPreference}
- Personalization seed: ${generationSeed}

USER TRAVEL PERSONALITY:
${vibePersonality}

DESTINATION PERSONALITY:
${destinationFlavor}

ABSOLUTE PERSONALIZATION RULES:
- The itinerary MUST change meaningfully based on selected vibes.
- Adventure must create active/outdoor/energy-heavy days.
- Party must create nightlife/social/late-evening plans where realistic.
- Relaxed must create slow mornings, cafes, sunsets, wellness, low-rush pacing.
- Nature must create scenic viewpoints, rivers, trails, gardens, beaches, mountains or green spaces.
- Luxury must create boutique stays, private transfers, curated meals, premium comfort and no-rush timing.
- Cafes must include cafe-hopping, brunches, coffee breaks and aesthetic local food stops.
- Hidden Gems must include lesser-crowded/local-feeling places, not only famous tourist spots.
- For mixed vibes, combine them naturally. Example: Adventure + Cafes = active morning + scenic cafe evenings. Party + Friends = nightlife-heavy and social. Relaxed + Couple = romantic slow travel.
- Do NOT give the same route, same places, or same daily structure for different vibe combinations.
- Avoid generic lines like “visit local attractions” unless specific examples are included.

ANTI-REPETITION RULES:
- Do not reuse the exact same main attractions across all 3 plans unless absolutely unavoidable.
- Each plan must have a different day-wise rhythm, not just different prices.
- Each plan must include different food/cafe/activity suggestions.
- Each plan must feel different in pacing, tone, transport, stay, activity density, and comfort.
- Use destination-specific places/experiences, but rotate them based on vibe and tier.
- If a place appears in more than one plan, the reason/timing/experience style must be different.
- Do not sound like fixed pre-written data. Make it feel dynamically customized.

CRITICAL BUDGET CONTEXT:
- Budget is TOTAL GROUP BUDGET, not per person.
- All pricing must be total group estimate.
- Do not say "per person" as main pricing.
- Keep plans realistic for Indian domestic travel.
- Generate only supported destination logic.
- Minimum realistic budget for this destination/group/duration is ₹${minimumRequiredBudget.toLocaleString('en-IN')} total.
- User's selected budget is ${groupBudgetLabel} total.

STRICT BUDGET TIER RULES:
1. Budget Saver:
   - Must be the most basic realistic itinerary.
   - Estimated range must stay between ₹${budgetSaverMin.toLocaleString('en-IN')} and ₹${budgetSaverMax.toLocaleString('en-IN')} total.
   - Use budget stays, hostels, guesthouses, local food, public/shared transport, free or low-cost activities.
   - This is the minimum viable trip plan.
   - Still respect the selected vibe, but execute it in a low-cost way.

2. Smart Comfort:
   - Must feel clearly better than Budget Saver.
   - Estimated range must stay between ₹${smartComfortMin.toLocaleString('en-IN')} and ₹${smartComfortMax.toLocaleString('en-IN')} total.
   - Use better homestays or 3-star stays, more convenient transport, better food options, selected paid activities.
   - This should feel like the best value option.
   - Must be the most balanced version of the selected vibe.

3. Premium Experience:
   - Must feel clearly upgraded compared to Smart Comfort.
   - Estimated range must stay between ₹${premiumMin.toLocaleString('en-IN')} and ₹${premiumMax.toLocaleString('en-IN')} total.
   - Use boutique stays/resorts where realistic, private transport, premium experiences, better cafes/restaurants, comfort-first planning.
   - This can exceed the user's budget, but must explain why.
   - Must be the most polished version of the selected vibe.

DAILY PLAN RULES:
- Create exactly ${data.days} items in dailyPlan.
- Each day must start with "Day X:".
- Each day must mention morning/afternoon/evening style in one concise sentence.
- Each day should include specific experiences or place types suitable for ${data.destination}.
- Do not make every day overloaded; pacing should match selected vibes and party type.
- If travelWith is couple, make it more romantic/comfortable.
- If travelWith is friends, make it more social/flexible/fun.
- If travelWith is family, make it safer and less chaotic.
- If travelWith is solo, make it practical, safe, reflective and easy to manage.

PLAN DIFFERENTIATION RULES:
- Solo travelers:
  prioritize flexibility, peaceful exploration, local culture, safe movement, cafes, scenic reflection spots, and self-paced activities.

- Couples:
  prioritize romantic cafes, sunset spots, aesthetic stays, cozy dinners, scenic experiences, slow moments, and intimate activities.

- Friends groups:
  prioritize energetic activities, nightlife, social experiences, adventure, group fun, shared transport, and memorable high-energy moments.

- Families:
  prioritize safety, comfort, kid-friendly or parent-friendly attractions, smoother pacing, practical transport, relaxed sightseeing, and family-oriented stays.
- Do not generate three similar plans.
- Each plan must have a different stayStyle.
- Each plan must have a different transportStyle.
- Each plan must have different highlights.
- Each plan must have a clear budgetNote explaining why it costs less or more.
- Budget Saver should not mention premium stays.
- Premium Experience should not look like a basic budget plan.
- Smart Comfort should sit between both clearly.

OUTPUT QUALITY RULES:
- Use Indian Rupee formatting.
- Keep text practical, exciting, and startup-product polished.
- Avoid fake exact hotel names unless very common/general; use style categories instead.
- Do not include markdown.
- Do not include explanations outside JSON.
- Return valid JSON only.

Return ONLY JSON:

{
  "plans": [
    {
      "title": "Budget Saver",
      "description": "A vibe-matched low-cost plan customized for ${data.travelWith} travelers who selected ${vibeText}.",
      "estimatedRange": "₹${budgetSaverMin.toLocaleString('en-IN')}–₹${budgetSaverMax.toLocaleString('en-IN')} total for the group · ${data.travelers} travelers · ${data.days} days",
      "bestFor": "Travelers who want the most affordable realistic trip while still matching their selected vibe.",
      "stayStyle": "",
      "transportStyle": "",
      "dailyPlan": ["Day 1: ", "Day 2: "],
      "highlights": [],
      "budgetNote": "Explain why this is the cheapest realistic option and how it still matches the selected vibe."
    },
    {
      "title": "Smart Comfort",
      "description": "A balanced personalized plan with stronger comfort, smoother movement, and better experience value for ${vibeText}.",
      "estimatedRange": "₹${smartComfortMin.toLocaleString('en-IN')}–₹${smartComfortMax.toLocaleString('en-IN')} total for the group · ${data.travelers} travelers · ${data.days} days",
      "bestFor": "Travelers who want comfort and good experiences without overspending.",
      "stayStyle": "",
      "transportStyle": "",
      "dailyPlan": ["Day 1: ", "Day 2: "],
      "highlights": [],
      "budgetNote": "Explain what upgrades make this cost more than Budget Saver."
    },
    {
      "title": "Premium Experience",
      "description": "A comfort-first premium plan that turns the selected vibe into a polished, curated escape.",
      "estimatedRange": "₹${premiumMin.toLocaleString('en-IN')}–₹${premiumMax.toLocaleString('en-IN')} total for the group · ${data.travelers} travelers · ${data.days} days",
      "bestFor": "Travelers who prefer convenience, comfort, and premium experiences.",
      "stayStyle": "",
      "transportStyle": "",
      "dailyPlan": ["Day 1: ", "Day 2: "],
      "highlights": [],
      "budgetNote": "Explain what premium upgrades make this cost more than Smart Comfort."
    }
  ]
}`;
}

function buildVibePersonality(data: TripRequest): string {
  const vibeMap: Record<string, string> = {
    adventure:
      '- Adventure: active mornings, outdoor activities, treks/water/adventure moments, energetic pacing.',
    party:
      '- Party: late evenings, nightlife/social places where realistic, flexible mornings, friends-first energy.',
    relaxed:
      '- Relaxed: slow mornings, sunset points, wellness, cafes, low-rush route, fewer packed activities.',
    nature:
      '- Nature: scenic viewpoints, trails, rivers/beaches/mountains/gardens, sunrise/sunset nature moments.',
    luxury:
      '- Luxury: boutique stays, private transfers, curated meals, comfort-first timing, premium experiences.',
    cafes:
      '- Cafes: brunch, coffee breaks, aesthetic cafes, local food spots, chill evening hangouts.',
    hidden:
      '- Hidden Gems: lesser-crowded places, local lanes, underrated viewpoints, non-touristy experiences.',
  };

  const selected = data.vibe
    .map((vibe) => vibeMap[vibe])
    .filter(Boolean)
    .join('\n');

  const partyTypeMap: Record<string, string> = {
    solo: '- Solo traveler: safe, manageable, reflective, practical, easy local movement.',
    couple:
      '- Couple trip: romantic timing, sunsets, cozy cafes, privacy, balanced comfort.',
    friends:
      '- Friends trip: social, flexible, fun, energetic, group-friendly activities.',
    family:
      '- Family trip: safe, comfortable, not too rushed, easy transport, broad appeal.',
  };

  return `${selected || '- General: balanced and personalized.'}\n${
    partyTypeMap[data.travelWith] || '- Group type: balanced group-friendly pacing.'
  }`;
}

function buildDestinationFlavor(destination: string): string {
  const clean = destination.toLowerCase();

  if (clean.includes('goa')) {
    return '- Goa: beaches, sunsets, cafes, forts, markets, water activities, nightlife, South/North Goa contrast.';
  }

  if (clean.includes('manali')) {
    return '- Manali: mountain roads, cafes, Solang/Atal-style adventure, old Manali vibes, riverside scenery, snow/valley views.';
  }

  if (clean.includes('shimla')) {
    return '- Shimla: Mall Road, ridge views, pine forests, Kufri-style day trips, colonial charm, cozy hill cafes.';
  }

  if (clean.includes('mussoorie')) {
    return '- Mussoorie: viewpoints, Mall Road, Landour-style cafes, waterfalls, cloud walks, slow hill-station charm.';
  }

  if (clean.includes('rishikesh') || clean.includes('haridwar')) {
    return '- Haridwar-Rishikesh: ghats, Ganga aarti, rafting/adventure, cafes, yoga/wellness, river viewpoints, spiritual calm.';
  }

  if (clean.includes('mcleod') || clean.includes('dharamshala')) {
    return '- McLeodganj: monastery calm, mountain cafes, Triund-style trails, Tibetan food, viewpoints, slow backpacker energy.';
  }

  if (clean.includes('udaipur')) {
    return '- Udaipur: lakes, palaces, sunset points, old city lanes, rooftop cafes, romantic/royal slow travel.';
  }

  return '- Destination: use specific local-feeling activities, food, viewpoints, transport and pacing.';
}

function parseTripPlans(text: string): TripPlan[] {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    const plans = parsed.plans || [];

    return plans.map((plan: TripPlan) => ({
      title: plan.title || 'Trip Plan',
      description: plan.description || 'Personalized experience',
      estimatedRange: plan.estimatedRange || 'Flexible group estimate',
      bestFor: plan.bestFor || 'Personalized travelers',
      stayStyle: plan.stayStyle || 'Comfortable accommodations',
      transportStyle: plan.transportStyle || 'Practical transportation',
      dailyPlan: Array.isArray(plan.dailyPlan) ? plan.dailyPlan : [],
      highlights: Array.isArray(plan.highlights)
        ? plan.highlights.slice(0, 5)
        : [],
      budgetNote:
        plan.budgetNote ||
        'Group-total estimate; confirm live rates before booking.',
    }));
  } catch (error) {
    console.error('[parseTripPlans] Error parsing response:', error);

    return [
      {
        title: 'Budget Saver',
        description:
          'Lowest realistic plan focused on saving money without making the trip impractical.',
        estimatedRange:
          'Minimum realistic group total — open each plan for a tailored band',
        bestFor: 'Travelers who want the most affordable realistic trip',
        stayStyle: 'Hostels, guesthouses, and budget accommodations',
        transportStyle: 'Public transport, shared cabs, and local travel options',
        dailyPlan: ['Day 1: Arrival, budget stay check-in, and local orientation'],
        highlights: [
          'Budget-friendly accommodations',
          'Local food',
          'Public transport tips',
        ],
        budgetNote:
          'This plan keeps costs low using budget stays, local food, shared transport, and free or low-cost activities.',
      },
      {
        title: 'Smart Comfort',
        description:
          'Balanced plan with better comfort, smoother movement, and stronger experience value.',
        estimatedRange:
          'Around selected group budget — open each plan for a tailored band',
        bestFor: 'Travelers who want comfort and good experiences without overspending',
        stayStyle: 'Good homestays, quality guesthouses, or 3-star hotels',
        transportStyle: 'Mix of public transport, rented vehicle, and selected private transfers',
        dailyPlan: ['Day 1: Arrival with comfortable check-in and curated local exploration'],
        highlights: [
          'Comfortable stay',
          'Better food options',
          'Popular attractions',
        ],
        budgetNote:
          'This plan costs more than Budget Saver because it adds better stays, smoother transport, and selected paid experiences.',
      },
      {
        title: 'Premium Experience',
        description:
          'Comfort-first upgraded plan with premium stays, private transport, and curated experiences.',
        estimatedRange:
          'Above selected group budget — open each plan for a tailored band',
        bestFor: 'Travelers who prefer convenience, comfort, and premium experiences',
        stayStyle: 'Boutique hotels, premium resorts, or upgraded private stays',
        transportStyle: 'Private cab, premium transfers, and comfort-first local movement',
        dailyPlan: ['Day 1: Premium arrival, upgraded stay check-in, and curated experience'],
        highlights: ['Premium stay', 'Fine dining', 'Private transport'],
        budgetNote:
          'This plan costs more because it upgrades stay quality, transport convenience, food options, and premium experiences.',
      },
    ];
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Trip generation API is ready',
      provider: 'Google Gemini',
      model: 'gemini-2.5-flash',
    },
    { status: 200 }
  );
}