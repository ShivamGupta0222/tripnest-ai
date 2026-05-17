'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BudgetWarningModal } from '@/components/ui/budget-warning-modal';
import { FormErrorModal } from '@/components/ui/form-error-modal';

const vibeOptions = [
  { id: 'adventure', label: 'Adventure', emoji: '⛰️' },
  { id: 'party', label: 'Party', emoji: '🎉' },
  { id: 'relaxed', label: 'Relaxed', emoji: '🧘' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'luxury', label: 'Luxury', emoji: '✨' },
  { id: 'cafes', label: 'Cafes', emoji: '☕' },
  { id: 'hidden', label: 'Hidden Gems', emoji: '💎' },
];

const travelWithOptions = [
  { id: 'solo', label: 'Solo', emoji: '🧑' },
  { id: 'couple', label: 'Couple', emoji: '👫' },
  { id: 'friends', label: 'Friends', emoji: '👥' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
];

const budgetStyleOptions = [
  { id: 'saver', label: 'Budget Saver', emoji: '💰' },
  { id: 'balanced', label: 'Balanced Comfort', emoji: '⚖️' },
  { id: 'premium', label: 'Premium Experience', emoji: '✨' },
];

const transportOptions = [
  { id: 'cheapest', label: 'Cheapest', emoji: '🚌' },
  { id: 'fastest', label: 'Fastest', emoji: '✈️' },
  { id: 'comfortable', label: 'Most Comfortable', emoji: '🚗' },
];

const languageOptions = [
  { id: 'English', label: 'English', emoji: '🇺🇸' },
  { id: 'Hindi', label: 'हिन्दी', emoji: '🇮🇳' },
  { id: 'Gujarati', label: 'ગુજરાતી', emoji: '🟢' },
  { id: 'Tamil', label: 'தமிழ்', emoji: '🔴' },
];

const uiText = {
  English: {
    title: 'Craft Your Next Escape ✈️',
    subtitle:
      'From mountain mornings to beach sunsets — TripNest AI builds your trip around your vibe, group and budget.',
    startingCity: 'Starting City',
    cityPlaceholder: 'e.g., Delhi',
    pickupCity: 'Pickup city',
    cityHelp: 'Start from a supported city — more pickup cities are coming soon.',
    cityError: 'We are currently not serving this city yet.',
    destination: 'Dream Destination',
    destinationPlaceholder: 'e.g., Goa',
    supported: 'Supported',
    destinationHelp: 'Choose a supported escape — more destinations are coming soon.',
    destinationError: 'We are currently not supporting this destination yet.',
    budget: 'Budget',
    realisticBudget: 'Your budget looks realistic for',
    recommendedMinimum: 'Recommended minimum',
    budgetShort: 'Your budget is short by',
    travelers: 'Travel Squad Size',
    travelersHelp: 'Allowed range: 1 to 20 travelers.',
    duration: 'Trip Duration',
    durationHelp: 'Allowed range: 1 to 30 days.',
    date: 'Journey Date',
    dateHelp: 'Select a valid future date from the calendar.',
    comingAlong: 'Who’s coming along?',
    soloInfo: 'Solo mode is active because you selected 1 traveler.',
    coupleDisabled:
      'Couple mode is disabled for odd traveler counts. Use 2 travelers for Couple mode.',
    travelInfo:
      'Solo is available only for 1 traveler. Couple works best with 2 travelers.',
    vibe: 'Pick your travel vibe',
    budgetMood: 'Choose your budget mood',
    transport: 'Transport Preference',
    language: 'Preferred Language 🌐',
    languageHelp:
      'Your itinerary will be generated in this language. More Indian languages coming soon ✨',
    buttonLoading: 'Building your travel vibe...',
    button: 'Plan My Escape ✨',
    loadingTitle: 'Building your travel vibe...',
    loadingDescription:
      "We're building budget, comfort, and premium trip options around your destination, group size, and travel vibe.",
    holdTight: 'Hold tight — TripNest AI is crafting your journey.',
    missingTitle: 'Missing trip details',
    missingMessage:
      'Please enter your from city and destination before generating your trip.',
    cityNotSupportedTitle: 'City not supported yet',
    cityNotSupportedMessage:
      'TripNest AI is currently available for selected major Indian cities. Please choose a supported city from the suggestions.',
    destinationNotSupportedTitle: 'Destination not supported yet',
    destinationNotSupportedMessage:
      'TripNest AI currently supports Shimla, Mussoorie, Manali, Haridwar-Rishikesh, Goa, McLeodganj, and Udaipur.',
    invalidDateTitle: 'Invalid travel date',
    invalidDateMessage:
      'Please select a valid future travel date from the calendar.',
    vibeTitle: 'Choose your travel vibe',
    vibeMessage:
      'Please select at least one travel vibe so TripNest AI can personalize your itinerary.',
    travelerTitle: 'Complete traveler details',
    travelerMessage:
      'Please enter a valid number of travelers and days before generating your trip.',
    generationFailed: 'Trip generation failed',
    destinationLines: {
      goa: 'Beach sunsets, cafes and late-night vibes await 🌊',
      manali: 'Mountain air, cafes and scenic roads await 🏔️',
      udaipur: 'Royal lakes, sunsets and calm luxury await 🏰',
      rishikesh: 'River rafting, cafés and peaceful mornings await 🛶',
      shimla: 'Mall Road walks, pine air and cozy cafés await 🌲',
      mussoorie: 'Cloudy viewpoints, cafés and slow mountain walks await ☁️',
      mcleodganj: 'Monastery calm, mountain cafés and hidden trails await 🏕️',
    },
  },
  Hindi: {
    title: 'अपनी अगली ट्रिप बनाएं ✈️',
    subtitle:
      'पहाड़ों की सुबह से बीच सनसेट तक — TripNest AI आपकी पसंद, ग्रुप और बजट के हिसाब से ट्रिप बनाता है।',
    startingCity: 'शुरुआती शहर',
    cityPlaceholder: 'जैसे, Delhi',
    pickupCity: 'पिकअप शहर',
    cityHelp: 'सपोर्टेड शहर चुनें — और शहर जल्द आ रहे हैं।',
    cityError: 'हम अभी इस शहर में सर्विस नहीं दे रहे हैं।',
    destination: 'सपनों की जगह',
    destinationPlaceholder: 'जैसे, Goa',
    supported: 'सपोर्टेड',
    destinationHelp: 'सपोर्टेड डेस्टिनेशन चुनें — और जगहें जल्द आ रही हैं।',
    destinationError: 'हम अभी इस डेस्टिनेशन को सपोर्ट नहीं कर रहे हैं।',
    budget: 'बजट',
    realisticBudget: 'आपका बजट ठीक लग रहा है',
    recommendedMinimum: 'सुझाया गया न्यूनतम बजट',
    budgetShort: 'आपका बजट कम है',
    travelers: 'कितने लोग जा रहे हैं',
    travelersHelp: 'सीमा: 1 से 20 यात्री।',
    duration: 'ट्रिप कितने दिन की है',
    durationHelp: 'सीमा: 1 से 30 दिन।',
    date: 'यात्रा की तारीख',
    dateHelp: 'कैलेंडर से सही भविष्य की तारीख चुनें।',
    comingAlong: 'कौन साथ आ रहा है?',
    soloInfo: '1 यात्री चुनने की वजह से Solo mode active है।',
    coupleDisabled:
      'Odd traveler count में Couple mode disabled है। Couple के लिए 2 यात्री रखें।',
    travelInfo: 'Solo सिर्फ 1 यात्री के लिए है। Couple 2 यात्रियों के लिए best है।',
    vibe: 'अपना travel vibe चुनें',
    budgetMood: 'अपना बजट मूड चुनें',
    transport: 'Transport preference',
    language: 'भाषा चुनें 🌐',
    languageHelp:
      'आपकी itinerary इसी भाषा में generate होगी। और भारतीय भाषाएँ जल्द आ रही हैं ✨',
    buttonLoading: 'आपकी ट्रिप बन रही है...',
    button: 'मेरी ट्रिप बनाएं ✨',
    loadingTitle: 'आपकी ट्रिप vibe बन रही है...',
    loadingDescription:
      'हम आपके destination, group size और travel vibe के हिसाब से budget, comfort और premium trip options बना रहे हैं।',
    holdTight: 'थोड़ा इंतज़ार करें — TripNest AI आपकी यात्रा बना रहा है।',
    missingTitle: 'Trip details missing हैं',
    missingMessage: 'Trip generate करने से पहले starting city और destination डालें।',
    cityNotSupportedTitle: 'यह शहर अभी supported नहीं है',
    cityNotSupportedMessage:
      'TripNest AI अभी selected major Indian cities में available है। कृपया suggestions से supported city चुनें।',
    destinationNotSupportedTitle: 'यह destination अभी supported नहीं है',
    destinationNotSupportedMessage:
      'TripNest AI अभी Shimla, Mussoorie, Manali, Haridwar-Rishikesh, Goa, McLeodganj और Udaipur support करता है।',
    invalidDateTitle: 'Travel date सही नहीं है',
    invalidDateMessage: 'कृपया calendar से valid future travel date चुनें।',
    vibeTitle: 'Travel vibe चुनें',
    vibeMessage: 'Personalized itinerary के लिए कम से कम एक travel vibe चुनें।',
    travelerTitle: 'Traveler details complete करें',
    travelerMessage:
      'Trip generate करने से पहले travelers और days की valid संख्या डालें।',
    generationFailed: 'Trip generation failed',
    destinationLines: {
      goa: 'Beach sunsets, cafes और late-night vibes आपका इंतज़ार कर रहे हैं 🌊',
      manali: 'Mountain air, cafes और scenic roads आपका इंतज़ार कर रहे हैं 🏔️',
      udaipur: 'Royal lakes, sunsets और calm luxury आपका इंतज़ार कर रहे हैं 🏰',
      rishikesh: 'River rafting, cafés और peaceful mornings आपका इंतज़ार कर रहे हैं 🛶',
      shimla: 'Mall Road walks, pine air और cozy cafés आपका इंतज़ार कर रहे हैं 🌲',
      mussoorie: 'Cloudy viewpoints, cafés और slow mountain walks आपका इंतज़ार कर रहे हैं ☁️',
      mcleodganj: 'Monastery calm, mountain cafés और hidden trails आपका इंतज़ार कर रहे हैं 🏕️',
    },
  },
  Gujarati: {
    title: 'તમારી આગામી ટ્રિપ બનાવો ✈️',
    subtitle:
      'પર્વતની સવારથી બીચ સનસેટ સુધી — TripNest AI તમારી પસંદ, ગ્રુપ અને બજેટ મુજબ ટ્રિપ બનાવે છે.',
    startingCity: 'શરૂઆતનું શહેર',
    cityPlaceholder: 'દા.ત., Delhi',
    pickupCity: 'પિકઅપ શહેર',
    cityHelp: 'સપોર્ટેડ શહેર પસંદ કરો — વધુ શહેરો જલ્દી આવશે.',
    cityError: 'અમે હાલમાં આ શહેરમાં સર્વિસ આપતા નથી.',
    destination: 'તમારી મનપસંદ જગ્યા',
    destinationPlaceholder: 'દા.ત., Goa',
    supported: 'સપોર્ટેડ',
    destinationHelp: 'સપોર્ટેડ ડેસ્ટિનેશન પસંદ કરો — વધુ જગ્યાઓ જલ્દી આવશે.',
    destinationError: 'અમે હાલમાં આ ડેસ્ટિનેશન સપોર્ટ કરતા નથી.',
    budget: 'બજેટ',
    realisticBudget: 'તમારું બજેટ યોગ્ય લાગે છે',
    recommendedMinimum: 'સૂચવાયેલું ન્યૂનતમ બજેટ',
    budgetShort: 'તમારું બજેટ ઓછું છે',
    travelers: 'કેટલા લોકો જશે',
    travelersHelp: 'મર્યાદા: 1 થી 20 પ્રવાસીઓ.',
    duration: 'ટ્રિપની અવધિ',
    durationHelp: 'મર્યાદા: 1 થી 30 દિવસ.',
    date: 'યાત્રાની તારીખ',
    dateHelp: 'કેલેન્ડરમાંથી યોગ્ય future date પસંદ કરો.',
    comingAlong: 'કોણ સાથે આવી રહ્યું છે?',
    soloInfo: '1 traveler પસંદ કરવાને કારણે Solo mode active છે.',
    coupleDisabled:
      'Odd traveler count માટે Couple mode disabled છે. Couple માટે 2 travelers રાખો.',
    travelInfo: 'Solo ફક્ત 1 traveler માટે છે. Couple માટે 2 travelers best છે.',
    vibe: 'તમારો travel vibe પસંદ કરો',
    budgetMood: 'તમારો budget mood પસંદ કરો',
    transport: 'Transport preference',
    language: 'ભાષા પસંદ કરો 🌐',
    languageHelp:
      'તમારી itinerary આ ભાષામાં generate થશે. વધુ ભારતીય ભાષાઓ જલ્દી આવશે ✨',
    buttonLoading: 'તમારી ટ્રિપ બની રહી છે...',
    button: 'મારી ટ્રિપ બનાવો ✨',
    loadingTitle: 'તમારી travel vibe બની રહી છે...',
    loadingDescription:
      'અમે તમારા destination, group size અને travel vibe મુજબ budget, comfort અને premium trip options બનાવી રહ્યા છીએ.',
    holdTight: 'થોડું રાહ જુઓ — TripNest AI તમારી journey બનાવી રહ્યું છે.',
    missingTitle: 'Trip details missing છે',
    missingMessage: 'Trip generate કરતા પહેલાં starting city અને destination દાખલ કરો.',
    cityNotSupportedTitle: 'આ શહેર હજુ supported નથી',
    cityNotSupportedMessage:
      'TripNest AI હાલમાં selected major Indian cities માટે available છે. Suggestionsમાંથી supported city પસંદ કરો.',
    destinationNotSupportedTitle: 'આ destination હજુ supported નથી',
    destinationNotSupportedMessage:
      'TripNest AI હાલમાં Shimla, Mussoorie, Manali, Haridwar-Rishikesh, Goa, McLeodganj અને Udaipur support કરે છે.',
    invalidDateTitle: 'Travel date યોગ્ય નથી',
    invalidDateMessage: 'કૃપા કરીને calendarમાંથી valid future travel date પસંદ કરો.',
    vibeTitle: 'Travel vibe પસંદ કરો',
    vibeMessage: 'Personalized itinerary માટે ઓછામાં ઓછો એક travel vibe પસંદ કરો.',
    travelerTitle: 'Traveler details complete કરો',
    travelerMessage:
      'Trip generate કરતા પહેલાં travelers અને days ની valid સંખ્યા દાખલ કરો.',
    generationFailed: 'Trip generation failed',
    destinationLines: {
      goa: 'Beach sunsets, cafes અને late-night vibes તમારી રાહ જોઈ રહ્યા છે 🌊',
      manali: 'Mountain air, cafes અને scenic roads તમારી રાહ જોઈ રહ્યા છે 🏔️',
      udaipur: 'Royal lakes, sunsets અને calm luxury તમારી રાહ જોઈ રહ્યા છે 🏰',
      rishikesh: 'River rafting, cafés અને peaceful mornings તમારી રાહ જોઈ રહ્યા છે 🛶',
      shimla: 'Mall Road walks, pine air અને cozy cafés તમારી રાહ જોઈ રહ્યા છે 🌲',
      mussoorie: 'Cloudy viewpoints, cafés અને slow mountain walks તમારી રાહ જોઈ રહ્યા છે ☁️',
      mcleodganj: 'Monastery calm, mountain cafés અને hidden trails તમારી રાહ જોઈ રહ્યા છે 🏕️',
    },
  },
  Tamil: {
    title: 'உங்கள் அடுத்த பயணத்தை உருவாக்குங்கள் ✈️',
    subtitle:
      'மலை காலைகளில் இருந்து கடற்கரை சூரிய அஸ்தமனம் வரை — TripNest AI உங்கள் vibe, group மற்றும் budget அடிப்படையில் trip உருவாக்கும்.',
    startingCity: 'தொடங்கும் நகரம்',
    cityPlaceholder: 'எ.கா., Delhi',
    pickupCity: 'Pickup city',
    cityHelp: 'Supported city தேர்வு செய்யுங்கள் — மேலும் நகரங்கள் விரைவில் வரும்.',
    cityError: 'இந்த நகரத்தில் நாங்கள் தற்போது சேவை வழங்கவில்லை.',
    destination: 'Dream Destination',
    destinationPlaceholder: 'எ.கா., Goa',
    supported: 'Supported',
    destinationHelp: 'Supported escape தேர்வு செய்யுங்கள் — மேலும் destinations விரைவில் வரும்.',
    destinationError: 'இந்த destination தற்போது supported இல்லை.',
    budget: 'Budget',
    realisticBudget: 'உங்கள் budget realistic ஆக உள்ளது',
    recommendedMinimum: 'Recommended minimum',
    budgetShort: 'உங்கள் budget குறைவாக உள்ளது',
    travelers: 'Travel Squad Size',
    travelersHelp: 'Allowed range: 1 முதல் 20 travelers.',
    duration: 'Trip Duration',
    durationHelp: 'Allowed range: 1 முதல் 30 நாட்கள்.',
    date: 'Journey Date',
    dateHelp: 'Calendar-ல் இருந்து valid future date தேர்வு செய்யுங்கள்.',
    comingAlong: 'யார் யார் வருகிறார்கள்?',
    soloInfo: '1 traveler தேர்வு செய்ததால் Solo mode active ஆக உள்ளது.',
    coupleDisabled:
      'Odd traveler count-க்கு Couple mode disabled. Couple mode-க்கு 2 travelers பயன்படுத்தவும்.',
    travelInfo: 'Solo 1 traveler-க்கு மட்டுமே. Couple 2 travelers-க்கு best.',
    vibe: 'உங்கள் travel vibe தேர்வு செய்யுங்கள்',
    budgetMood: 'உங்கள் budget mood தேர்வு செய்யுங்கள்',
    transport: 'Transport Preference',
    language: 'மொழி தேர்வு 🌐',
    languageHelp:
      'உங்கள் itinerary இந்த மொழியில் generate ஆகும். மேலும் இந்திய மொழிகள் விரைவில் வரும் ✨',
    buttonLoading: 'உங்கள் trip உருவாகிறது...',
    button: 'என் Trip உருவாக்கு ✨',
    loadingTitle: 'உங்கள் travel vibe உருவாகிறது...',
    loadingDescription:
      'உங்கள் destination, group size மற்றும் travel vibe அடிப்படையில் budget, comfort மற்றும் premium trip options உருவாக்குகிறோம்.',
    holdTight: 'சிறிது காத்திருக்கவும் — TripNest AI உங்கள் journey உருவாக்குகிறது.',
    missingTitle: 'Trip details missing',
    missingMessage: 'Trip generate செய்வதற்கு முன் starting city மற்றும் destination உள்ளிடுங்கள்.',
    cityNotSupportedTitle: 'இந்த city இன்னும் supported இல்லை',
    cityNotSupportedMessage:
      'TripNest AI தற்போது selected major Indian cities-ல் available. Suggestions-ல் இருந்து supported city தேர்வு செய்யுங்கள்.',
    destinationNotSupportedTitle: 'இந்த destination இன்னும் supported இல்லை',
    destinationNotSupportedMessage:
      'TripNest AI தற்போது Shimla, Mussoorie, Manali, Haridwar-Rishikesh, Goa, McLeodganj மற்றும் Udaipur support செய்கிறது.',
    invalidDateTitle: 'Travel date invalid',
    invalidDateMessage: 'Calendar-ல் இருந்து valid future travel date தேர்வு செய்யுங்கள்.',
    vibeTitle: 'Travel vibe தேர்வு செய்யுங்கள்',
    vibeMessage: 'Personalized itinerary-க்காக குறைந்தது ஒரு travel vibe தேர்வு செய்யுங்கள்.',
    travelerTitle: 'Traveler details complete செய்யுங்கள்',
    travelerMessage:
      'Trip generate செய்வதற்கு முன் valid travelers மற்றும் days number உள்ளிடுங்கள்.',
    generationFailed: 'Trip generation failed',
    destinationLines: {
      goa: 'Beach sunsets, cafes மற்றும் late-night vibes காத்திருக்கின்றன 🌊',
      manali: 'Mountain air, cafes மற்றும் scenic roads காத்திருக்கின்றன 🏔️',
      udaipur: 'Royal lakes, sunsets மற்றும் calm luxury காத்திருக்கின்றன 🏰',
      rishikesh: 'River rafting, cafés மற்றும் peaceful mornings காத்திருக்கின்றன 🛶',
      shimla: 'Mall Road walks, pine air மற்றும் cozy cafés காத்திருக்கின்றன 🌲',
      mussoorie: 'Cloudy viewpoints, cafés மற்றும் slow mountain walks காத்திருக்கின்றன ☁️',
      mcleodganj: 'Monastery calm, mountain cafés மற்றும் hidden trails காத்திருக்கின்றன 🏕️',
    },
  },
} as const;

type SupportedLanguage = keyof typeof uiText;

const supportedCities = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Chandigarh',
  'Dehradun',
  'Agra',
  'Indore',
  'Bhopal',
  'Surat',
  'Nagpur',
  'Patna',
  'Varanasi',
];

const supportedDestinations = [
  'Shimla',
  'Mussoorie',
  'Manali',
  'Haridwar-Rishikesh',
  'Goa',
  'McLeodganj',
  'Udaipur',
];

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

const loadingSteps = [
  'Reading your travel vibe...',
  'Checking your group budget...',
  'Matching stays and transport...',
  'Finding local experiences...',
  'Creating 3 trip styles...',
  'Polishing your itinerary cards...',
];

type BudgetWarning = {
  destinationName: string;
  minimumRequiredBudget: number;
  enteredBudget: number;
  travelers: number;
  days: number;
  minPerPersonPerDay: number;
};

type FormError = {
  title: string;
  message: string;
};

export function TripForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const [budgetWarning, setBudgetWarning] = useState<BudgetWarning | null>(
    null
  );
  const [isBudgetWarningOpen, setIsBudgetWarningOpen] = useState(false);

  const [formError, setFormError] = useState<FormError | null>(null);

  const [formData, setFormData] = useState({
    from: '',
    destination: '',
    budget: 20000,
    travelers: 2,
    days: 3,
    dates: '',
    travelWith: 'friends',
    budgetStyle: 'balanced',
    transport: 'cheapest',
    language: 'English',
  });

  const [travelersInput, setTravelersInput] = useState('2');
  const [daysInput, setDaysInput] = useState('3');

  const [selectedVibes, setSelectedVibes] = useState<string[]>(['adventure']);

  const [focusedField, setFocusedField] = useState<
    'city' | 'destination' | null
  >(null);

  const today = new Date().toISOString().split('T')[0];

  const citySuggestions = supportedCities.filter((city) =>
    city.toLowerCase().includes(formData.from.trim().toLowerCase())
  );

  const destinationSuggestions = supportedDestinations.filter((destination) =>
    destination
      .toLowerCase()
      .includes(formData.destination.trim().toLowerCase())
  );

  const currentLanguage = formData.language as SupportedLanguage;
  const t = uiText[currentLanguage] || uiText.English;

  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isLoading]);

  const showFormError = (title: string, message: string) => {
    setFormError({ title, message });
  };

  const getDestinationBudgetRule = (destination: string) => {
    const cleanDestination = destination.trim().toLowerCase();

    return destinationBudgetRules.find((rule) =>
      rule.keys.some((key) => cleanDestination.includes(key))
    );
  };

  const destinationRule = getDestinationBudgetRule(formData.destination);
  const recommendedBudget = destinationRule
    ? destinationRule.minPerPersonPerDay * formData.travelers * formData.days
    : null;

  const budgetGap = recommendedBudget
    ? recommendedBudget - formData.budget
    : 0;

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe)
        ? prev.filter((v) => v !== vibe)
        : [...prev, vibe]
    );
  };

  const updateTravelers = (value: number) => {
    const safeValue = Math.max(1, Math.min(20, value));

    if (safeValue > 1 && formData.travelWith === 'solo') {
      setFormData({
        ...formData,
        travelers: safeValue,
        travelWith: 'friends',
      });
      setTravelersInput(String(safeValue));
      return;
    }

    if (safeValue === 1) {
      setFormData({
        ...formData,
        travelers: 1,
        travelWith: 'solo',
      });
      setTravelersInput('1');
      return;
    }

    setFormData({
      ...formData,
      travelers: safeValue,
    });
    setTravelersInput(String(safeValue));
  };

  const updateDays = (value: number) => {
    const safeValue = Math.max(1, Math.min(30, value));

    setFormData({
      ...formData,
      days: safeValue,
    });
    setDaysInput(String(safeValue));
  };

  const handleTravelWithChange = (travelType: string) => {
    if (travelType === 'solo') {
      setFormData({
        ...formData,
        travelWith: 'solo',
        travelers: 1,
      });
      setTravelersInput('1');
      return;
    }

    const nextTravelers = formData.travelers < 2 ? 2 : formData.travelers;

    setFormData({
      ...formData,
      travelWith: travelType,
      travelers: nextTravelers,
    });
    setTravelersInput(String(nextTravelers));
  };

  const handleTravelersInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (value === '') {
      setTravelersInput('');
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setTravelersInput(value);

    const numericValue = Number(value);

    if (numericValue >= 1 && numericValue <= 20) {
      updateTravelers(numericValue);
    }
  };

  const handleTravelersBlur = () => {
    if (travelersInput === '') {
      updateTravelers(formData.travelers || 1);
      return;
    }

    updateTravelers(Number(travelersInput));
  };

  const handleDaysInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setDaysInput('');
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setDaysInput(value);

    const numericValue = Number(value);

    if (numericValue >= 1 && numericValue <= 30) {
      updateDays(numericValue);
    }
  };

  const handleDaysBlur = () => {
    if (daysInput === '') {
      updateDays(formData.days || 1);
      return;
    }

    updateDays(Number(daysInput));
  };

  const isSupportedCity = (cityName: string) => {
    const normalizedCity = cityName.trim().toLowerCase();

    return supportedCities.some(
      (city) => city.toLowerCase() === normalizedCity
    );
  };

  const isSupportedDestination = (destinationName: string) => {
    const normalizedDestination = destinationName.trim().toLowerCase();

    return supportedDestinations.some(
      (destination) => destination.toLowerCase() === normalizedDestination
    );
  };

  const scrollToTravelersInput = () => {
    const travelerInput = document.getElementById('travelers-input');

    if (travelerInput) {
      travelerInput.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      setTimeout(() => {
        travelerInput.focus();
      }, 400);
    }
  };

  const handleGenerateTrip = async () => {
    if (!formData.from || !formData.destination) {
      showFormError(
        t.missingTitle,
        t.missingMessage
      );
      return;
    }

    if (!isSupportedCity(formData.from)) {
      showFormError(
        t.cityNotSupportedTitle,
        t.cityNotSupportedMessage
      );
      return;
    }

    if (!isSupportedDestination(formData.destination)) {
      showFormError(
        t.destinationNotSupportedTitle,
        t.destinationNotSupportedMessage
      );
      return;
    }

    const selectedDate = new Date(formData.dates);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (
      !formData.dates ||
      selectedDate < todayDate ||
      selectedDate.getFullYear() > 2035
    ) {
      showFormError(
        t.invalidDateTitle,
        t.invalidDateMessage
      );
      return;
    }

    if (selectedVibes.length === 0) {
      showFormError(
        t.vibeTitle,
        t.vibeMessage
      );
      return;
    }

    if (travelersInput === '' || daysInput === '') {
      showFormError(
        t.travelerTitle,
        t.travelerMessage
      );
      return;
    }

    setIsLoading(true);

    try {
   const tripData = {
  fromCity: formData.from.trim(),
  destination: formData.destination.trim(),
  budget: formData.budget,
  travelers: formData.travelers,
  days: formData.days,
  dates: formData.dates,
  travelWith: formData.travelWith,
  vibe: selectedVibes,
  budgetStyle: formData.budgetStyle,
  transportPreference: formData.transport,
  language: formData.language,
};


localStorage.setItem(
  'tripnestPreferences',
  JSON.stringify({
    vibe: selectedVibes,
    budgetStyle: formData.budgetStyle,
    travelWith: formData.travelWith,
    transport: formData.transport,
    travelers: formData.travelers,
    language: formData.language,
  })
);

      const response = await fetch('/api/generate-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.code === 'BUDGET_TOO_LOW' && errorData.budgetWarning) {
          setBudgetWarning(errorData.budgetWarning);
          setIsBudgetWarningOpen(true);
          return;
        }

        throw new Error(errorData.error || 'Failed to generate trip plans');
      }

      const result = await response.json();

      if (result.plans && Array.isArray(result.plans)) {
        sessionStorage.setItem('generatedTrips', JSON.stringify(result.plans));
        sessionStorage.setItem('tripFormData', JSON.stringify(tripData));

        router.push('/results');
      } else {
        throw new Error(result.error || 'Failed to generate trip plans');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      showFormError(t.generationFailed, errorMessage);
      console.error('[TripForm] Error generating trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-xl sm:items-center sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <motion.div
            className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
          />

          <motion.div
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-purple-400/30 bg-background/90 p-5 shadow-2xl shadow-purple-500/20 sm:p-7 max-h-[92vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400" />

            <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
              <motion.div
  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-2 sm:h-16 sm:w-16"
  animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
  transition={{ duration: 2.2, repeat: Infinity }}
>
  <img
    src="/tripnest-logo.png"
    alt="TripNest AI"
    className="h-full w-full object-contain"
  />
</motion.div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-purple-300">
                  TripNest AI
                </p>
                <h3 className="mt-1 text-xl font-bold sm:text-2xl">
                  {t.loadingTitle}
                </h3>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <motion.p
                key={loadingStepIndex}
                className="text-base font-semibold text-white sm:text-lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {loadingSteps[loadingStepIndex]}
              </motion.p>

              <p className="mt-2 text-sm leading-6 text-foreground/60">
                {t.loadingDescription}
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400"
                  animate={{ x: ['-100%', '120%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '55%' }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-foreground/60 sm:mt-5 sm:gap-3 sm:text-xs">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                💸 Budget
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                🌅 Comfort
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                ✨ Premium
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-foreground/45">
              {t.holdTight}
            </p>
          </motion.div>
        </motion.div>
      )}

      <BudgetWarningModal
        open={isBudgetWarningOpen}
        warning={budgetWarning}
        onClose={() => setIsBudgetWarningOpen(false)}
        onIncreaseBudget={() => {
          if (budgetWarning) {
            setFormData((prev) => ({
              ...prev,
              budget: budgetWarning.minimumRequiredBudget,
            }));
          }

          setIsBudgetWarningOpen(false);
        }}
        onEditTravelers={() => {
          setIsBudgetWarningOpen(false);
          scrollToTravelersInput();
        }}
      />

      <FormErrorModal
        open={!!formError}
        title={formError?.title || ''}
        message={formError?.message || ''}
        onClose={() => setFormError(null)}
      />

      <section id="plans" className="scroll-mt-28 px-3 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="mb-4 text-center text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.title}
          </motion.h2>

          <motion.p
            className="mb-8 text-center text-sm leading-6 text-foreground/60 sm:mb-12 sm:text-base"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { emoji: '🌅', text: 'Sunset escapes' },
              { emoji: '🏔️', text: 'Mountain mornings' },
              { emoji: '🍜', text: 'Local food vibes' },
              { emoji: '🛶', text: 'Adventure moments' },
            ].map((item) => (
              <motion.div
                key={item.text}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center backdrop-blur"
              >
                <p className="text-2xl">{item.emoji}</p>
                <p className="mt-2 text-xs text-foreground/70 sm:text-sm">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="glass rounded-3xl p-5 sm:p-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.startingCity}
                </label>

                <div className="relative">
                  <input
                   data-testid="city-input"
                    type="text"
                    placeholder={t.cityPlaceholder}
                    value={formData.from}
                    autoComplete="off"
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => {
                      window.setTimeout(() => setFocusedField(null), 160);
                    }}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        from: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                  />

                  {focusedField === 'city' && citySuggestions.length > 0 && (
                    <motion.div
                      className="absolute left-0 right-0 top-[52px] z-50 max-h-56 overflow-y-auto rounded-2xl border border-white/10 bg-[#080b16]/95 p-2 shadow-2xl shadow-purple-500/20 backdrop-blur-xl"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {citySuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onMouseDown={() => {
                            setFormData({
                              ...formData,
                              from: city,
                            });
                            setFocusedField(null);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-foreground/75 transition hover:bg-purple-500/15 hover:text-white"
                        >
                          <span>{city}</span>
                          <span className="text-xs text-purple-300">
                            {t.pickupCity}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <p className="text-xs text-foreground/50 mt-2">
                    {t.cityHelp}
                  </p>

                  {formData.from.trim() !== '' &&
                    !isSupportedCity(formData.from) && (
                      <p className="text-xs text-red-400 mt-2">
                        {t.cityError}
                      </p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.destination}
                </label>

                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.destinationPlaceholder}
                    value={formData.destination}
                    autoComplete="off"
                    onFocus={() => setFocusedField('destination')}
                    onBlur={() => {
                      window.setTimeout(() => setFocusedField(null), 160);
                    }}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destination: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                  />

                  {focusedField === 'destination' &&
                    destinationSuggestions.length > 0 && (
                      <motion.div
                        className="absolute left-0 right-0 top-[52px] z-50 max-h-56 overflow-y-auto rounded-2xl border border-white/10 bg-[#080b16]/95 p-2 shadow-2xl shadow-blue-500/20 backdrop-blur-xl"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {destinationSuggestions.map((destination) => (
                          <button
                            key={destination}
                            type="button"
                            onMouseDown={() => {
                              setFormData({
                                ...formData,
                                destination,
                              });
                              setFocusedField(null);
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-foreground/75 transition hover:bg-blue-500/15 hover:text-white"
                          >
                            <span>{destination}</span>
                            <span className="text-xs text-blue-300">
                              {t.supported}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}

                  <p className="text-xs text-foreground/50 mt-2">
                    {t.destinationHelp}
                  </p>

                  {formData.destination.trim() !== '' &&
                    !isSupportedDestination(formData.destination) && (
                      <p className="text-xs text-red-400 mt-2">
                        {t.destinationError}
                      </p>
                    )}

                  {formData.destination.trim() !== '' &&
                    isSupportedDestination(formData.destination) && (
                      <p className="mt-2 text-xs text-cyan-200">
                        {formData.destination.toLowerCase().includes('goa') &&
                          t.destinationLines.goa}

                        {formData.destination
                          .toLowerCase()
                          .includes('manali') &&
                          t.destinationLines.manali}

                        {formData.destination
                          .toLowerCase()
                          .includes('udaipur') &&
                          t.destinationLines.udaipur}

                        {formData.destination
                          .toLowerCase()
                          .includes('rishikesh') &&
                          t.destinationLines.rishikesh}

                        {formData.destination
                          .toLowerCase()
                          .includes('shimla') &&
                          t.destinationLines.shimla}

                        {formData.destination
                          .toLowerCase()
                          .includes('mussoorie') &&
                          t.destinationLines.mussoorie}

                        {formData.destination
                          .toLowerCase()
                          .includes('mcleodganj') &&
                          t.destinationLines.mcleodganj}
                      </p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.budget}: ₹{formData.budget.toLocaleString('en-IN')}
                </label>

                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="1000"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-border/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />

                {destinationRule && recommendedBudget && (
                  <div
                    className={`mt-3 rounded-xl border px-4 py-3 text-xs leading-5 ${
                      formData.budget >= recommendedBudget
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200'
                    }`}
                  >
                    {formData.budget >= recommendedBudget ? (
                      <>
                        {t.realisticBudget} {destinationRule.name}.{' '}
                        {t.recommendedMinimum}: ₹
                        {recommendedBudget.toLocaleString('en-IN')}.
                      </>
                    ) : (
                      <>
                        {t.recommendedMinimum} for {destinationRule.name}: ₹
                        {recommendedBudget.toLocaleString('en-IN')}. {t.budgetShort} ₹
                        {budgetGap.toLocaleString('en-IN')}.
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.travelers}
                </label>

                <input
                  id="travelers-input"
                  type="number"
                  min="1"
                  max="20"
                  value={travelersInput}
                  onChange={handleTravelersInputChange}
                  onBlur={handleTravelersBlur}
                  className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                />

                <p className="text-xs text-foreground/50 mt-2">
                  {t.travelersHelp}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.duration}
                </label>

                <input
                  id="days-input"
                  type="number"
                  min="1"
                  max="30"
                  value={daysInput}
                  onChange={handleDaysInputChange}
                  onBlur={handleDaysBlur}
                  className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                />

                <p className="text-xs text-foreground/50 mt-2">
                  {t.durationHelp}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.date}
                </label>

                <input
                  type="date"
                  value={formData.dates}
                  min={today}
                  max="2035-12-31"
                  onKeyDown={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dates: e.target.value,
                    })
                  }
                  className="w-full cursor-pointer rounded-xl border border-border/50 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-purple-500"
                  style={{ colorScheme: 'dark' }}
                />

                <p className="text-xs text-foreground/50 mt-2">
                  {t.dateHelp}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                {t.comingAlong}
              </label>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {travelWithOptions.map((option) => {
                  const isSoloDisabled =
                    option.id === 'solo' && formData.travelers > 1;

                  const isCoupleDisabled =
                    option.id === 'couple' &&
                    (formData.travelers < 2 || formData.travelers % 2 !== 0);

                  const isDisabled = isSoloDisabled || isCoupleDisabled;

                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleTravelWithChange(option.id)}
                      className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                        formData.travelWith === option.id
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                          : 'bg-background border-border/50 hover:border-purple-500'
                      } ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                      whileHover={{
                        y: isDisabled ? 0 : -2,
                      }}
                    >
                      <span className="text-2xl">{option.emoji}</span>

                      <span className="text-xs font-medium">
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-foreground/50">
                {formData.travelers === 1
                  ? t.soloInfo
                  : formData.travelers % 2 !== 0
                    ? t.coupleDisabled
                    : t.travelInfo}
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                {t.vibe}
              </label>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {vibeOptions.map((vibe) => (
                  <motion.button
                    key={vibe.id}
                    type="button"
                    onClick={() => toggleVibe(vibe.id)}
                    className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                      selectedVibes.includes(vibe.id)
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-background border-border/50 hover:border-purple-500'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="text-xl">{vibe.emoji}</span>

                    <span className="text-xs font-medium">{vibe.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                {t.budgetMood}
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {budgetStyleOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        budgetStyle: option.id,
                      })
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                      formData.budgetStyle === option.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-background border-border/50 hover:border-purple-500'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="text-2xl">{option.emoji}</span>

                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                {t.transport}
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {transportOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        transport: option.id,
                      })
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                      formData.transport === option.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-background border-border/50 hover:border-purple-500'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="text-2xl">{option.emoji}</span>

                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">
                {t.language}
              </label>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {languageOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        language: option.id,
                      })
                    }
                    className={`px-4 py-3 rounded-xl transition-all flex flex-col items-center gap-2 border ${
                      formData.language === option.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'bg-background border-border/50 hover:border-purple-500'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <span className="text-2xl">{option.emoji}</span>

                    <span className="text-sm font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>

              <p className="mt-3 text-xs text-foreground/50">
                {t.languageHelp}
              </p>
            </div>

            <motion.button
              type="button"
              onClick={handleGenerateTrip}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-70 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading
                ? t.buttonLoading
                : t.button}
            </motion.button>
          </motion.div>
        </div>
      </section>
    </>
  );
}