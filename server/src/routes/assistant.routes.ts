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

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    keywords: ['vaccine', 'immunization', 'schedule', 'baby', 'child', 'தடுப்பூசி', 'அட்டவணை', 'குழந்தை'],
    titleEn: 'National & Tamil Nadu Immunization Schedule',
    titleTa: 'தேசிய மற்றும் தமிழ்நாடு தடுப்பூசி அட்டவணை',
    answerEn:
      'Under the National Immunization Schedule (NIS) in Tamil Nadu, childhood vaccines start at birth with BCG, OPV-0, and Hepatitis B birth dose. Subsequent doses are scheduled at 6, 10, and 14 weeks (Pentavalent, Oral Polio Vaccine, Rotavirus, fIPV, and PCV), followed by MR and PCV booster around 9-12 months. Please check your child\'s timeline in MaternaTrack for exact verified dates.',
    answerTa:
      'தமிழ்நாடு மற்றும் தேசிய தடுப்பூசி அட்டவணையின்படி, பிறந்தவுடன் பிசிஜி (BCG), ஓபிவி-0 (OPV-0), ஹெபடைடிஸ் பி தடுப்பூசிகள் போடப்படுகின்றன. அடுத்து 6, 10, 14 வாரங்களில் பென்டாவேலண்ட், ரோட்டா வைரஸ், எஃப்ஐபிவி, பிசிவி தடுப்பூசிகளும், 9-12 மாதங்களில் எம்ஆர் (MR) தடுப்பூசியும் வழங்கப்படுகின்றன.',
    sourceTitle: 'Ministry of Health and Family Welfare (MOHFW) - Universal Immunization Programme',
    sourceUrl: 'https://www.mohfw.gov.in/sites/default/files/Universal.pdf',
    reviewDate: '2024-01-15',
  },
  {
    keywords: ['pregnancy', 'anc', 'antenatal', 'checkup', 'கர்ப்பம்', 'பரிசோதனை', 'தாய்மை'],
    titleEn: 'Antenatal Care (ANC) Guidelines',
    titleTa: 'கர்ப்பகால தாய் சேய் பரிசோதனை வழிகாட்டுதல்கள்',
    answerEn:
      'Every pregnant woman should have at least 4 comprehensive antenatal check-ups (ANC): ANC-1 within the first 12 weeks, ANC-2 between 14-26 weeks, ANC-3 between 28-34 weeks, and ANC-4 at 36 weeks until delivery. Key services include blood pressure, hemoglobin testing, ultrasound scan, Td vaccination, and IFA supplementation.',
    answerTa:
      'ஒவ்வொரு கர்ப்பிணித் தாயும் குறைந்தது 4 முறையான தாய் சேய் பரிசோதனைகளை (ANC) பெற வேண்டும்: 12 வாரங்களுக்குள் முதல் பரிசோதனை, 14-26 வாரங்களில் இரண்டாம் முறை, 28-34 வாரங்களில் மூன்றாம் முறை, 36 வாரங்களில் நான்காம் முறை. இரத்த அழுத்தம், ஹீமோகுளோபின், அல்ட்ராசவுண்ட் ஸ்கேன் மற்றும் டிடி (Td) தடுப்பூசி ஆகியவை இதில் அடங்கும்.',
    sourceTitle: 'Reproductive, Maternal, Newborn, Child and Adolescent Health (RMNCH+A) MOHFW',
    sourceUrl: 'https://rmnch.mohfw.gov.in/',
    reviewDate: '2024-02-10',
  },
  {
    keywords: ['missed', 'overdue', 'late', 'தவறிய', 'தாமதம்'],
    titleEn: 'Missed Visit Recovery & Catch-up Guidance',
    titleTa: 'தவறிய பரிசோதனை அல்லது தடுப்பூசி வழிமுறை',
    answerEn:
      'If you missed a scheduled appointment or vaccination, do not worry. Contact your assigned ASHA/ANM health worker through the MaternaTrack portal to reschedule. MaternaTrack automatically alerts your healthcare worker so a home visit or rescheduling can be arranged. Never skip a missed dose entirely without consulting a doctor.',
    answerTa:
      'திட்டமிடப்பட்ட தடுப்பூசி அல்லது மருத்துவ பரிசோதனை தவறிவிட்டால் கவலைப்பட வேண்டாம். உடனடியாக மதர்னாட்ராக் மூலம் உங்கள் ஆஷா/விஎச்என் சுகாதாரப் பணியாளரைத் தொடர்பு கொள்ளவும். அடுத்த வருகை தேதியை சுகாதாரப் பணியாளர் திட்டமிடுவார்.',
    sourceTitle: 'Directorate of Public Health & Preventive Medicine, Tamil Nadu',
    sourceUrl: 'https://www.tnhealth.org/directorate/dphis.php',
    reviewDate: '2024-03-01',
  },
  {
    keywords: ['worker', 'asha', 'anm', 'contact', 'பணியாளர்', 'ஆஷா'],
    titleEn: 'Connecting with Your Health Worker',
    titleTa: 'உங்கள் சுகாதாரப் பணியாளரை தொடர்பு கொள்ளுதல்',
    answerEn:
      'Your assigned Village Health Nurse (VHN) or ASHA worker is shown directly on your dashboard with their contact details. You can submit a callback request or contact-detail update through the Parent Portal.',
    answerTa:
      'உங்கள் கிராம சுகாதார செவிலியர் (VHN) அல்லது ஆஷா பணியாளரின் விவரங்கள் உங்கள் முதன்மை பக்கத்தில் உள்ளன. நீங்கள் அவர்களை எளிதாக தொடர்பு கொள்ளலாம்.',
    sourceTitle: 'National Health Mission - Community Health Workers',
    sourceUrl: 'https://rmnch.mohfw.gov.in/',
    reviewDate: '2024-01-20',
  },
  {
    keywords: ['emergency', 'danger', 'bleeding', 'pain', 'அவசரம்', 'ஆபத்து', 'வலி'],
    titleEn: 'Emergency & Warning Symptoms',
    titleTa: 'அவசர மற்றும் எச்சரிக்கை அறிகுறிகள்',
    answerEn:
      'IMPORTANT: If you experience severe abdominal pain, vaginal bleeding, high fever, severe headache with blurred vision, convulsions, or reduced fetal movements, seek IMMEDIATE emergency medical care at the nearest Government Hospital or PHC, or call 108 for ambulance assistance. MaternaTrack is an informational tool and does not provide emergency triage.',
    answerTa:
      'முக்கிய எச்சரிக்கை: அதிக வயிற்று வலி, ரத்தப்போக்கு, கடுமையான காய்ச்சல், தலைசுற்றல், பார்வை மங்குதல் அல்லது குழந்தையின் அசைவு குறைவது போன்ற அறிகுறிகள் இருந்தால் உடனடியாக அருகில் உள்ள அரசு மருத்துவமனைக்கு செல்லவும் அல்லது 108 ஆம்புலன்ஸ் எண்ணை அழைக்கவும்.',
    sourceTitle: 'Emergency Obstetric Care Guidelines - Tamil Nadu Health System',
    sourceUrl: 'https://www.tnhealth.org/',
    reviewDate: '2024-02-15',
  },
  {
    keywords: ['navigation', 'how', 'download', 'pdf', 'உதவி', 'பதிவிறக்கம்'],
    titleEn: 'Using MaternaTrack Portal',
    titleTa: 'மதர்னாட்ராக் தளத்தை பயன்படுத்துதல்',
    answerEn:
      'In MaternaTrack, you can switch language between English and Tamil anytime at the top navigation bar. Parents can view pregnancy care milestones, child immunization timelines, download PDF summaries, and request phone or address updates.',
    answerTa:
      'மதர்னாட்ராக் தளத்தில் மேல் பகுதியில் உள்ள மொழி தேர்வை மாற்றி தமிழ் மற்றும் ஆங்கிலத்தில் பயன்படுத்தலாம். தாய் மற்றும் குழந்தையின் தடுப்பூசி பதிவுகளை PDF வடிவில் பதிவிறக்கம் செய்ய முடியும்.',
    sourceTitle: 'MaternaTrack User Guide & Public Information',
    sourceUrl: 'https://rmnch.mohfw.gov.in/',
    reviewDate: '2026-01-01',
  },
];

// Query Assistant
router.post('/query', async (req, res) => {
  const { query, language = 'en' } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ success: false, error: 'Query text is required.' });
    return;
  }

  const normalized = query.toLowerCase();

  // Find best matching knowledge item
  let bestMatch: KnowledgeItem | null = null;
  let maxScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // If no specific match found, default to general guidance
  if (!bestMatch) {
    const isTa = language === 'ta';
    res.json({
      success: true,
      data: {
        mode: 'VERIFIED_INFORMATION_MODE',
        isAiGenerated: false,
        response: isTa
          ? 'மதர்னாட்ராக் பொது தாய் சேய் நல வழிகாட்டுதல்களை வழங்குகிறது. உங்கள் கர்ப்பகால பரிசோதனை அல்லது குழந்தையின் தடுப்பூசி அட்டவணை பற்றி வினவலாம். அவசர மருத்துவ உதவிக்கு உங்கள் அரசு மருத்துவமனை அல்லது 108 எண்ணை தொடர்பு கொள்ளவும்.'
          : 'MaternaTrack provides verified maternal and child health guidance grounded in official public health sources. You can ask about antenatal visits, vaccine schedules, or how to contact your health worker. For medical emergencies, please visit your nearest hospital or call 108.',
        source: {
          title: 'Reproductive and Child Health (RMNCH+A) Portal, MOHFW',
          url: 'https://rmnch.mohfw.gov.in/',
          reviewDate: '2024-02-10',
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
              'What should I do if a vaccination appointment was missed?',
            ],
      },
    });
    return;
  }

  const isTa = language === 'ta';
  res.json({
    success: true,
    data: {
      mode: 'VERIFIED_INFORMATION_MODE',
      isAiGenerated: false,
      title: isTa ? bestMatch.titleTa : bestMatch.titleEn,
      response: isTa ? bestMatch.answerTa : bestMatch.answerEn,
      source: {
        title: bestMatch.sourceTitle,
        url: bestMatch.sourceUrl,
        reviewDate: bestMatch.reviewDate,
      },
      suggestedQuestions: isTa
        ? [
            'அவசர மருத்துவ அறிகுறிகள் எவை?',
            'சுகாதாரப் பணியாளரை எவ்வாறு தொடர்பு கொள்வது?',
            'அட்டை மற்றும் பதிவுகளை எவ்வாறு பார்ப்பது?',
          ]
        : [
            'What are the emergency danger symptoms in pregnancy?',
            'How do I connect with my assigned health worker?',
            'How can I download my immunization summary?',
          ],
    },
  });
});

export default router;
