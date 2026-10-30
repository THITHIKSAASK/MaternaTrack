import { Router } from 'express';

const router = Router();

interface KnowledgeItem {
  keywords: string[];
  titleEn: string;
  titleTa: string;
  answerEn: string;
  answerTa: string;
  sourceTitle: string;
  sourceUrl: string;
  reviewDate: string;
}

const CLINICAL_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    keywords: ['vaccine', 'immunization', 'schedule', 'baby', 'child', 'தடுப்பூசி', 'அட்டவணை', 'குழந்தை', 'bcg', 'polio', 'opv', 'pentavalent', 'mr vaccine'],
    titleEn: 'National & Tamil Nadu Immunization Schedule',
    titleTa: 'தேசிய மற்றும் தமிழ்நாடு தடுப்பூசி அட்டவணை',
    answerEn:
      'Under the National Immunization Schedule (NIS) in Tamil Nadu, childhood vaccines start at birth with BCG, OPV-0, and Hepatitis B birth dose. Subsequent doses are scheduled at 6, 10, and 14 weeks (Pentavalent, Oral Polio Vaccine, Rotavirus, fIPV, and PCV), followed by MR-1 and PCV booster around 9-12 months, and MR-2, DPT booster, and OPV booster at 16-24 months. Please check your child\'s timeline in MaternaTrack for exact verified dates.',
    answerTa:
      'தமிழ்நாடு மற்றும் தேசிய தடுப்பூசி அட்டவணையின்படி, பிறந்தவுடன் பிசிஜி (BCG), ஓபிவி-0 (OPV-0), ஹெபடைடிஸ் பி தடுப்பூசிகள் போடப்படுகின்றன. அடுத்து 6, 10, 14 வாரங்களில் பென்டாவேலண்ட், ரோட்டா வைரஸ், எஃப்ஐபிவி, பிசிவி தடுப்பூசிகளும், 9-12 மாதங்களில் எம்ஆர் (MR-1) தடுப்பூசியும், 16-24 மாதங்களில் எம்ஆர்-2 மற்றும் டிபிடி பூஸ்டர் வழங்கப்படுகின்றன.',
    sourceTitle: 'Ministry of Health and Family Welfare (MOHFW) - Universal Immunization Programme',
    sourceUrl: 'https://www.mohfw.gov.in/sites/default/files/Universal.pdf',
    reviewDate: '2024-01-15',
  },
  {
    keywords: ['pregnancy', 'anc', 'antenatal', 'checkup', 'கர்ப்பம்', 'பரிசோதனை', 'தாய்மை', 'trimester', 'scan', 'ultrasound', 'blood pressure'],
    titleEn: 'Antenatal Care (ANC) Guidelines',
    titleTa: 'கர்ப்பகால தாய் சேய் பரிசோதனை வழிகாட்டுதல்கள்',
    answerEn:
      'Every pregnant woman should have at least 4 comprehensive antenatal check-ups (ANC): ANC-1 within the first 12 weeks, ANC-2 between 14-26 weeks, ANC-3 between 28-34 weeks, and ANC-4 at 36 weeks until delivery. Key services include blood pressure monitoring, hemoglobin and urine testing, abdominal examination, ultrasound scan, Tetanus/diphtheria (Td) vaccination, and daily Iron-Folic Acid (IFA) & Calcium supplementation.',
    answerTa:
      'ஒவ்வொரு கர்ப்பிணித் தாயும் குறைந்தது 4 முறையான தாய் சேய் பரிசோதனைகளை (ANC) பெற வேண்டும்: 12 வாரங்களுக்குள் முதல் பரிசோதனை, 14-26 வாரங்களில் இரண்டாம் முறை, 28-34 வாரங்களில் மூன்றாம் முறை, 36 வாரங்களில் நான்காம் முறை. இரத்த அழுத்தம், ஹீமோகுளோபின், அல்ட்ராசவுண்ட் ஸ்கேன் மற்றும் டிடி (Td) தடுப்பூசி ஆகியவை இதில் அடங்கும்.',
    sourceTitle: 'Reproductive, Maternal, Newborn, Child and Adolescent Health (RMNCH+A) MOHFW',
    sourceUrl: 'https://rmnch.mohfw.gov.in/',
    reviewDate: '2024-02-10',
  },
  {
    keywords: ['missed', 'overdue', 'late', 'தவறிய', 'தாமதம்', 'reschedule'],
    titleEn: 'Missed Visit Recovery & Catch-up Guidance',
    titleTa: 'தவறிய பரிசோதனை அல்லது தடுப்பூசி வழிமுறை',
    answerEn:
      'If you missed a scheduled appointment or vaccination, do not worry. Contact your assigned Village Health Nurse (VHN) or ASHA worker through the MaternaTrack portal to reschedule. MaternaTrack automatically flags overdue visits so catch-up plans can be scheduled immediately. Never skip a missed dose entirely without consulting your doctor or health worker.',
    answerTa:
      'திட்டமிடப்பட்ட தடுப்பூசி அல்லது மருத்துவ பரிசோதனை தவறிவிட்டால் கவலைப்பட வேண்டாம். உடனடியாக மதர்னாட்ராக் மூலம் உங்கள் ஆஷா/விஎச்என் சுகாதாரப் பணியாளரைத் தொடர்பு கொள்ளவும். அடுத்த வருகை தேதியை சுகாதாரப் பணியாளர் திட்டமிடுவார்.',
    sourceTitle: 'Directorate of Public Health & Preventive Medicine, Tamil Nadu',
    sourceUrl: 'https://www.tnhealth.org/directorate/dphis.php',
    reviewDate: '2024-03-01',
  },
  {
    keywords: ['worker', 'asha', 'anm', 'vhn', 'contact', 'பணியாளர்', 'ஆஷா', 'nurse'],
    titleEn: 'Connecting with Your Health Worker',
    titleTa: 'உங்கள் சுகாதாரப் பணியாளரை தொடர்பு கொள்ளுதல்',
    answerEn:
      'Your assigned Village Health Nurse (VHN) or ASHA worker is shown directly on your MaternaTrack dashboard with their phone number and sub-centre details. You can submit callback requests or address update requests through the Parent Portal.',
    answerTa:
      'உங்கள் கிராம சுகாதார செவிலியர் (VHN) அல்லது ஆஷா பணியாளரின் விவரங்கள் உங்கள் முதன்மை பக்கத்தில் உள்ளன. நீங்கள் அவர்களை எளிதாக தொடர்பு கொள்ளலாம்.',
    sourceTitle: 'National Health Mission - Community Health Workers',
    sourceUrl: 'https://rmnch.mohfw.gov.in/',
    reviewDate: '2024-01-20',
  },
  {
    keywords: ['emergency', 'danger', 'bleeding', 'pain', 'fever', 'convulsion', 'அவசரம்', 'ஆபத்து', 'வலி', '108', 'ambulance'],
    titleEn: 'Emergency & Warning Symptoms',
    titleTa: 'அவசர மற்றும் எச்சரிக்கை அறிகுறிகள்',
    answerEn:
      'CRITICAL SAFETY WARNING: If you or the mother experiences severe abdominal pain, vaginal bleeding, fluid leakage, high fever, severe persistent headache with blurred vision, convulsions/fits, or marked reduction in baby kicks, seek IMMEDIATE emergency care at the nearest Government Hospital or PHC, or call 108 ambulance service immediately.',
    answerTa:
      'முக்கிய எச்சரிக்கை: அதிக வயிற்று வலி, ரத்தப்போக்கு, கடுமையான காய்ச்சல், தலைசுற்றல், பார்வை மங்குதல் அல்லது குழந்தையின் அசைவு குறைவது போன்ற அறிகுறிகள் இருந்தால் உடனடியாக அருகில் உள்ள அரசு மருத்துவமனைக்கு செல்லவும் அல்லது 108 ஆம்புலன்ஸ் எண்ணை அழைக்கவும்.',
    sourceTitle: 'Emergency Obstetric Care Guidelines - Tamil Nadu Health System',
    sourceUrl: 'https://www.tnhealth.org/',
    reviewDate: '2024-02-15',
  },
  {
    keywords: ['nutrition', 'diet', 'food', 'iron', 'calcium', 'உணவு', 'சத்து', 'சாப்பாடு', 'folic'],
    titleEn: 'Maternal Nutrition & Diet Guidance',
    titleTa: 'கர்ப்பகால தாய் ஊட்டச்சத்து வழிகாட்டுதல்',
    answerEn:
      'During pregnancy, nutritional requirements increase. Consume balanced meals rich in iron (green leafy vegetables, drumstick leaves, jaggery, dates), calcium (milk, curd, ragi, sesame), and protein (lentils, pulses, eggs, lean meats). Take Iron-Folic Acid (IFA) tablets after meals with lemon water or amla juice for better absorption, not with tea or coffee.',
    answerTa:
      'கர்ப்ப காலத்தில் இரும்புச்சத்து (முருங்கைக்கீரை, பேரீச்சம்பழம், கீரைகள்), கால்சியம் (பால், தயிர், ராகி), மற்றும் புரதச்சத்து நிறைந்த உணவுகளை உட்கொள்ள வேண்டும். மருத்துவர் பரிந்துரைக்கும் இரும்புச்சத்து மற்றும் போலிக் அமில மாத்திரைகளை தவறாமல் எடுத்துக்கொள்ளவும்.',
    sourceTitle: 'National Institute of Nutrition (ICMR) - Dietary Guidelines for Indians',
    sourceUrl: 'https://www.nin.res.in/',
    reviewDate: '2024-02-20',
  },
];

// Helper: Solve simple math expressions
function tryEvaluateMath(query: string): string | null {
  const mathRegex = /(?:what\s+is|calculate|evaluate)?\s*([\d\.\s\+\-\*\/\(\)\%]+)\s*\??$/i;
  const match = query.match(mathRegex);
  if (!match) return null;
  const expr = match[1].trim();
  // Ensure expression contains at least one operator and numbers
  if (!/[\+\-\*\/]/.test(expr) && !expr.includes('%')) return null;
  // Prevent arbitrary execution
  if (!/^[\d\.\s\+\-\*\/\(\)\%]+$/.test(expr)) return null;

  try {
    if (expr.includes('% of')) {
      const parts = expr.split(/% of/i);
      const pct = parseFloat(parts[0]);
      const total = parseFloat(parts[1]);
      if (!isNaN(pct) && !isNaN(total)) {
        return `${pct}% of ${total} is ${(pct / 100) * total}`;
      }
    }
    // Safely evaluate simple arithmetic
    const sanitized = expr.replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
    const fn = new Function(`return (${sanitized})`);
    const res = fn();
    if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
      return `The result of ${expr} is ${res}.`;
    }
  } catch {
    return null;
  }
  return null;
}

// Helper: Search Wikipedia for encyclopedic queries
async function queryWikipedia(query: string): Promise<{ extract: string; title: string; url: string } | null> {
  try {
    // Extract key search term
    let cleanQuery = query
      .replace(/^(what is|who is|who was|tell me about|explain|describe|define)\s+/i, '')
      .replace(/[?!.]+$/, '')
      .trim();

    if (!cleanQuery || cleanQuery.length < 2) return null;

    // First try direct summary
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(summaryUrl, {
      headers: { 'User-Agent': 'MaternaTrack-AI/1.0 (PublicHealthEducation; contact@maternatrack.edu)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.extract && data.type !== 'disambiguation') {
        return {
          extract: data.extract,
          title: data.title,
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
        };
      }
    }

    // If direct summary didn't work, try Wikipedia search API
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanQuery
    )}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'MaternaTrack-AI/1.0' } });
    if (searchRes.ok) {
      const sData = (await searchRes.json()) as any;
      const firstHit = sData?.query?.search?.[0];
      if (firstHit && firstHit.title) {
        const pageRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstHit.title)}`);
        if (pageRes.ok) {
          const pData = (await pageRes.json()) as any;
          if (pData.extract) {
            return {
              extract: pData.extract,
              title: pData.title,
              url: pData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pData.title)}`,
            };
          }
        }
      }
    }
  } catch {
    // Timeout or network error
  }
  return null;
}

// Helper: Query external free LLM inference with timeout
async function queryGenerativeLLM(query: string, language: string): Promise<string | null> {
  // If user has GEMINI_API_KEY set, use Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const gRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are MaternaTrack AI, an intelligent, empathetic, and knowledgeable assistant. You answer all questions (maternal & child health, science, general knowledge, math, daily life, culture, etc.) accurately and concisely. Answer in ${
                      language === 'ta' ? 'Tamil' : 'English'
                    }.\n\nQuestion: ${query}`,
                  },
                ],
              },
            ],
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);
      if (gRes.ok) {
        const gData = (await gRes.json()) as any;
        const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      // Fall through to other providers
    }
  }

  // Next try Pollinations AI (with 5-second timeout)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const systemPrompt = `You are MaternaTrack AI, a helpful, polite, and comprehensive general assistant. Answer questions clearly, accurately, and politely in ${
      language === 'ta' ? 'Tamil' : 'English'
    }. Keep formatting clean and helpful.`;

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        model: 'openai',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      // If not rate limited
      if (text && !text.includes('Free limit reached') && !text.includes('Rate limit')) {
        return text.trim();
      }
    }
  } catch {
    // Handled by downstream fallbacks
  }

  return null;
}

// Built-in Smart General AI Knowledge Bank & Conversational Rules
function getBuiltinGeneralResponse(query: string, language: string): { response: string; title: string; sourceTitle: string; sourceUrl: string } | null {
  const norm = query.toLowerCase().trim();
  const isTa = language === 'ta';

  // Greetings
  if (/^(hi|hello|hey|vanakkam|வணக்கம்|good morning|good evening|good afternoon)/i.test(norm)) {
    return {
      title: isTa ? 'வரவேற்பு' : 'Greeting & Assistance',
      response: isTa
        ? 'வணக்கம்! நான் மதர்னாட்ராக் ஏஐ (MaternaTrack AI). தாய் சேய் நலம், தடுப்பூசி அட்டவணை, மருத்துவ வழிகாட்டல் மற்றும் பொதுவான அறிவியல், கல்வி, அன்றாட கேள்விகள் என எதை வேண்டுமானாலும் என்னிடம் கேட்கலாம். உங்களுக்கு இன்று எவ்வாறு உதவ முடியும்?'
        : 'Hello! I am MaternaTrack AI. I can answer any question you have — from maternal and child health milestones and vaccination schedules to science, history, daily life questions, and general knowledge. How can I help you today?',
      sourceTitle: 'MaternaTrack Intelligent Assistant',
      sourceUrl: 'https://maternatrack.org',
    };
  }

  // Who are you / Identity
  if (/(who are you|what can you do|what are you|உங்களை பற்றி|யார் நீங்கள்)/i.test(norm)) {
    return {
      title: isTa ? 'மதர்னாட்ராக் ஏஐ பற்றி' : 'About MaternaTrack AI',
      response: isTa
        ? 'நான் மதர்னாட்ராக் பொது செயற்கை நுண்ணறிவு உதவியாளர். தாய் மற்றும் சேய் பராமரிப்பு, தடுப்பூசிகள், ஊட்டச்சத்து மற்றும் எந்த பொதுவான கேள்விக்கும் (அறிவியல், கணிதம், வரலாறு, பொது அறிவு) விரிவான பதில்களை நான் வழங்குகிறேன்.'
        : 'I am MaternaTrack AI, a comprehensive general AI assistant. I provide end-to-end guidance on maternal and child healthcare (antenatal checkups, vaccines, nutrition, danger signs) as well as general knowledge, science, mathematics, technology, and everyday queries.',
      sourceTitle: 'MaternaTrack Knowledge & Clinical Intelligence',
      sourceUrl: 'https://maternatrack.org',
    };
  }

  // Newborn & baby care
  if (/(baby cry|baby sleep|breastfeed|colostrum|தாய்ப்பால்|குழந்தை அழுகை)/i.test(norm)) {
    return {
      title: isTa ? 'பச்சிளங்குழந்தை பராமரிப்பு மற்றும் தாய்ப்பால்' : 'Newborn Care & Exclusive Breastfeeding',
      response: isTa
        ? 'பிறந்த முதல் 6 மாதங்களுக்கு தாய்ப்பால் மட்டுமே போதுமானது (தண்ணீர் கூட தேவையில்லை). சீம்பால் (Colostrum) குழந்தையின் முதல் தடுப்பு மருந்தாகும்; இது குழந்தைக்கு நோய் எதிர்ப்பு சக்தியை தருகிறது. குழந்தை பசி, ஈரம் அல்லது தூக்கமின்மையால் அழலாம்; அமைதியாக தழுவி தாய்ப்பால் கொடுக்கவும்.'
        : 'Exclusive breastfeeding is recommended for the first 6 months of life (no water or other liquids needed). Colostrum, the thick yellowish early milk, acts as the baby\'s first natural vaccine with rich antibodies. Babies frequently cry to communicate hunger, discomfort, or need for soothing. Ensure frequent burping after feeds and monitor weight milestones.',
      sourceTitle: 'WHO & UNICEF Infant and Young Child Feeding Guidelines',
      sourceUrl: 'https://www.who.int/health-topics/breastfeeding',
    };
  }

  // Fever / Common illness in pregnancy or child
  if (/(fever|paracetamol|cold|cough|காய்ச்சல்|சளி)/i.test(norm)) {
    return {
      title: isTa ? 'காய்ச்சல் மற்றும் முதலுதவி வழிகாட்டுதல்' : 'Fever & General Symptom Guidance',
      response: isTa
        ? 'காய்ச்சல் இருந்தால் போதுமான அளவு தண்ணீர், நீர்ச்சத்து உணவுகளை உட்கொள்ளவும். ஓய்வு எடுக்கவும். கர்ப்ப காலத்தில் அல்லது 3 மாதத்திற்குட்பட்ட குழந்தைகளுக்கு காய்ச்சல் வந்தால் சுயமாக மாத்திரை சாப்பிடாமல், உடனடியாக உங்கள் மருத்துவர் அல்லது கிராம சுகாதார செவிலியரை (VHN) அணுகவும்.'
        : 'For mild fever, ensure optimal hydration with fluids, oral rehydration solutions, and adequate rest. During pregnancy or in infants under 3 months, never self-medicate without consulting your doctor or Village Health Nurse. Persistent high temperatures (over 100.4°F/38°C) or accompanying rashes require immediate clinical evaluation.',
      sourceTitle: 'National Health Portal (NHP) India - Fever Management',
      sourceUrl: 'https://www.nhp.gov.in/',
    };
  }

  // How does MaternaTrack work / System actions
  if (/(how does.*work|workflow|system|doctor|admin|health worker|reflect)/i.test(norm)) {
    return {
      title: isTa ? 'மதர்னாட்ராக் இயங்கும் முறை' : 'MaternaTrack Collaborative Care Workflow',
      response: isTa
        ? 'மதர்னாட்ராக் அமைப்பில் கிராம சுகாதாரப் பணியாளர் (VHN/ASHA), மருத்துவர் (Obstetrician/DGO), மற்றும் நிர்வாகி (Admin) இணைந்து செயல்படுகிறார்கள். சுகாதாரப் பணியாளர் புதிய பயனாளி அல்லது கர்ப்பிணித் தாயை பதிவு செய்தால், அது உடனடியாக மருத்துவருக்கும் கணினி நிர்வாகிக்கும் பிரதிபலித்து நேரடி கண்காணிப்பை உறுதி செய்கிறது.'
        : 'MaternaTrack connects the entire maternal and child health continuum. When a health worker registers a new mother or child, the patient record instantly reflects across the Doctor Dashboard and System Administrator Workspace. This enables shared risk stratification, automated appointment booking, real-time clinical review approvals, and zero lost-to-follow-up cases.',
      sourceTitle: 'MaternaTrack Collaborative System Architecture',
      sourceUrl: 'https://maternatrack.org/how-it-works',
    };
  }

  return null;
}

// POST /api/assistant/query
router.post('/query', async (req, res) => {
  const { query, language = 'en' } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ success: false, error: 'Query text is required.' });
    return;
  }

  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();
  const isTa = language === 'ta';

  // 1. First, check if query matches verified maternal & child health guidelines
  let bestClinicalMatch: KnowledgeItem | null = null;
  let maxScore = 0;

  for (const item of CLINICAL_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > maxScore && score >= 1) {
      maxScore = score;
      bestClinicalMatch = item;
    }
  }

  // If high clinical relevance, prioritize verified MOHFW / TN health response
  if (bestClinicalMatch && maxScore >= 2) {
    res.json({
      success: true,
      data: {
        mode: 'GENERAL_AI_ASSISTANT',
        isAiGenerated: false,
        title: isTa ? bestClinicalMatch.titleTa : bestClinicalMatch.titleEn,
        response: isTa ? bestClinicalMatch.answerTa : bestClinicalMatch.answerEn,
        source: {
          title: bestClinicalMatch.sourceTitle,
          url: bestClinicalMatch.sourceUrl,
          reviewDate: bestClinicalMatch.reviewDate,
        },
        suggestedQuestions: isTa
          ? [
              'கர்ப்பகாலத்தில் என்னென்ன சத்துணவுகள் அவசியம்?',
              'அவசர மருத்துவ அறிகுறிகள் எவை?',
              'சுகாதாரப் பணியாளரை எவ்வாறு தொடர்பு கொள்வது?',
            ]
          : [
              'What foods should I eat during pregnancy?',
              'What are the danger signs in pregnancy?',
              'How do I contact my assigned health worker?',
            ],
      },
    });
    return;
  }

  // 2. Check for simple math or arithmetic
  const mathResult = tryEvaluateMath(trimmed);
  if (mathResult) {
    res.json({
      success: true,
      data: {
        mode: 'GENERAL_AI_ASSISTANT',
        isAiGenerated: true,
        title: isTa ? 'கணித முடிவு' : 'Calculation Result',
        response: mathResult,
        source: {
          title: 'MaternaTrack Computational Engine',
          url: 'https://maternatrack.org',
          reviewDate: new Date().toISOString().split('T')[0],
        },
        suggestedQuestions: isTa
          ? ['குழந்தையின் தடுப்பூசி அட்டவணை என்ன?', 'கர்ப்பகால பராமரிப்பு பற்றி கூறு']
          : ['What is the child immunization schedule?', 'Calculate BMI for 65 kg and 165 cm'],
      },
    });
    return;
  }

  // 3. Try Generative LLM (Gemini or Pollinations)
  try {
    const generativeAnswer = await queryGenerativeLLM(trimmed, language);
    if (generativeAnswer && generativeAnswer.length > 15) {
      res.json({
        success: true,
        data: {
          mode: 'GENERAL_AI_ASSISTANT',
          isAiGenerated: true,
          title: isTa ? 'விரிவான ஏஐ பதில்' : 'AI Assistant Response',
          response: generativeAnswer,
          source: {
            title: 'MaternaTrack Intelligent Knowledge Base & AI',
            url: 'https://maternatrack.org/ai-knowledge',
            reviewDate: new Date().toISOString().split('T')[0],
          },
          suggestedQuestions: isTa
            ? [
                'மேலும் விளக்க முடியுமா?',
                'கர்ப்பகால முக்கிய பரிசோதனைகள் எவை?',
                'குழந்தை தடுப்பூசி நாள் தவறினால் என்ன செய்வது?',
              ]
            : [
                'Can you explain this in more detail?',
                'What are the 4 essential ANC checkups?',
                'What should I do if a vaccination was missed?',
              ],
        },
      });
      return;
    }
  } catch (err) {
    // Continue to fallback
  }

  // 4. Try Wikipedia Encyclopedic Knowledge (Science, History, World, Tech, Concepts)
  try {
    const wikiResult = await queryWikipedia(trimmed);
    if (wikiResult && wikiResult.extract) {
      res.json({
        success: true,
        data: {
          mode: 'GENERAL_AI_ASSISTANT',
          isAiGenerated: false,
          title: wikiResult.title,
          response: wikiResult.extract,
          source: {
            title: `Wikipedia — ${wikiResult.title}`,
            url: wikiResult.url,
            reviewDate: new Date().toISOString().split('T')[0],
          },
          suggestedQuestions: isTa
            ? ['கர்ப்பகால உணவு முறை என்ன?', 'குழந்தை பராமரிப்பு குறிப்புகள்']
            : ['Tell me about child nutrition', 'What is the child vaccination schedule?'],
        },
      });
      return;
    }
  } catch (err) {
    // Continue
  }

  // 5. Try Builtin Conversational / General Knowledge
  const builtin = getBuiltinGeneralResponse(trimmed, language);
  if (builtin) {
    res.json({
      success: true,
      data: {
        mode: 'GENERAL_AI_ASSISTANT',
        isAiGenerated: false,
        title: builtin.title,
        response: builtin.response,
        source: {
          title: builtin.sourceTitle,
          url: builtin.sourceUrl,
          reviewDate: new Date().toISOString().split('T')[0],
        },
        suggestedQuestions: isTa
          ? [
              'குழந்தையின் தடுப்பூசி அட்டவணை என்ன?',
              'கர்ப்பகாலத்தில் எத்தனை பரிசோதனைகள் தேவை?',
              'அவசர அறிகுறிகள் எவை?',
            ]
          : [
              'What is the child immunization schedule?',
              'How many ANC checkups are recommended during pregnancy?',
              'What should I do if a vaccination appointment was missed?',
            ],
      },
    });
    return;
  }

  // 6. If partially matched clinical knowledge, return it
  if (bestClinicalMatch) {
    res.json({
      success: true,
      data: {
        mode: 'GENERAL_AI_ASSISTANT',
        isAiGenerated: false,
        title: isTa ? bestClinicalMatch.titleTa : bestClinicalMatch.titleEn,
        response: isTa ? bestClinicalMatch.answerTa : bestClinicalMatch.answerEn,
        source: {
          title: bestClinicalMatch.sourceTitle,
          url: bestClinicalMatch.sourceUrl,
          reviewDate: bestClinicalMatch.reviewDate,
        },
        suggestedQuestions: isTa
          ? ['அவசர மருத்துவ அறிகுறிகள் எவை?', 'சுகாதாரப் பணியாளரை எவ்வாறு தொடர்பு கொள்வது?']
          : ['What are the emergency danger symptoms in pregnancy?', 'How do I connect with my health worker?'],
      },
    });
    return;
  }

  // 7. Final General Assistant Response
  res.json({
    success: true,
    data: {
      mode: 'GENERAL_AI_ASSISTANT',
      isAiGenerated: true,
      title: isTa ? 'பொது ஏஐ வழிகாட்டல்' : 'General AI Guidance',
      response: isTa
        ? `உங்கள் கேள்வி: "${trimmed}". மதர்னாட்ராக் ஏஐ பொதுவான அறிவியல், கல்வி, தாய் சேய் நல திட்டங்கள் மற்றும் மருத்துவ தகவல்களை வழங்குகிறது. கர்ப்பகால பரிசோதனை, குழந்தை தடுப்பூசி, உணவு முறைகள் அல்லது குறிப்பிட்ட தலைப்புகள் பற்றி மேலும் விரிவாக கேட்கலாம்.`
        : `Regarding your query "${trimmed}": MaternaTrack AI is ready to answer any general knowledge, healthcare, educational, or computational questions. You can ask about antenatal care milestones, vaccination schedules, science and biology concepts, or community healthcare steps.`,
      source: {
        title: 'MaternaTrack Public Health & General Intelligence Hub',
        url: 'https://maternatrack.org',
        reviewDate: new Date().toISOString().split('T')[0],
      },
      suggestedQuestions: isTa
        ? [
            'குழந்தையின் தடுப்பூசி அட்டவணை என்ன?',
            'கர்ப்பகாலத்தில் எத்தனை பரிசோதனைகள் தேவை?',
            'தடுப்பூசி நாள் தவறினால் என்ன செய்வது?',
          ]
        : [
            'What is the child immunization schedule?',
            'How many ANC checkups are recommended during pregnancy?',
            'What are emergency symptoms during pregnancy?',
          ],
    },
  });
});

export default router;
