import type { TranslationDict } from "./en";
import { en } from "./en";

export const ta: TranslationDict = {
  ...en,
  appSubtitle: "முடி & தலையோடு விவரம்",
  chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
  suggestedLanguages: "பரிந்துரைக்கப்பட்ட மொழிகள்",
  recommended: "பரிந்துரை",
  otherLanguages: "மற்ற மொழிகள் →",
  searchLanguages: "மொழிகளைத் தேடுங்கள்...",
  selectLanguagePlaceholder: "மொழியைத் தேர்ந்தெடுக்கவும்",
  whisperSearchHint: "எங்கள் பேச்சு மாதிரியில் ஆதரிக்கப்படும் மொழிகளைத் தேடுகிறது",
  searchingLanguages: "தேடுகிறது...",
  noLanguagesFound: "பொருந்தும் மொழிகள் இல்லை",
  reintake: "மீண்டும் இன்டேக்",
  back: "பின்",
  continue: "தொடரவும்",
  startOver: "மீண்டும் தொடங்க",
  welcomeBack: "மீண்டும் வரவேற்கிறோம்",
  savedProgress:
    "உங்கள் முன்னேற்றம் சேமிக்கப்பட்டது. {total}-ல் {current} கேள்வியில் இருந்தீர்கள்.",
  language: "மொழி",
  listen: "கேளுங்கள்",
  questionHelper: "உங்களுக்கு வசதியான விருப்பத்தைத் தேர்ந்தெடுக்கவும்.",
  otherSpeak: "வேறு 🎤",
  tellUsInYourWords: "உங்கள் சொந்த வார்த்தைகளில் சொல்லுங்கள்.",
  tapAndSpeak: "தட்டி பேசத் தொடங்குங்கள்",
  useThis: "இதைப் பயன்படுத்து",
  tryAgain: "மீண்டும் முயற்சி",
  yes: "ஆம்",
  no: "இல்லை",
  aboutHalfway: "பாதி வழி முடிந்தது",
  questionOf: "கேள்வி {current} / {total}",
  sectionComplete: "முடிந்தது",
  nextSection: "அடுத்து",
  almostDone: "ஏர்பாடி முடிந்தது ✓",
  reviewAnswers: "உங்கள் பதில்களை மதிப்பாய்வு செய்யுங்கள்.",
  reviewAloud: "பதில்களை சத்தமாக கேளுங்கள்",
  submitIntake: "விவரத்தை சமர்ப்பிக்க",
  edit: "திருத்து",
  intakeComplete: "விவரம் முடிந்தது",
  recordedIn: "உங்கள் பதில்கள் {language} இல் பதிவு செய்யப்பட்டன.",
  viewInEnglish: "ஆங்கிலத்தில் பார்",
  viewOriginal: "அசல் பதில்களை பார்",
  viewStructuredData: "Structured data பார்",
  comingSoon: "விரைவில்",
  comingSoonMessage:
    "இந்த மொழி விரைவில் வரும். ஆங்கிலம், தமிழ் அல்லது ஹிந்தியைத் தேர்ந்தெடுக்கவும்.",
  personalHistory: "தனிப்பட்ட வரலாறு",
  healthFactors: "ஆரோக்கிய & hormonal காரணிகள்",
  lifestyleTriggers: "வாழ்க்கை முறை & சூழல் தூண்டுதல்கள்",
  hairCareTreatments: "முடி பராமரிப்பு & சிகிச்சைகள்",
  sampleConsent: "மாதிரி & ஒப்புதல்",
  sections: {
    A: "தனிப்பட்ட & குடும்ப முடி உதிர்வு வரலாறு",
    B: "Hormonal & ஆரோக்கிய தாக்கங்கள்",
    C: "வாழ்க்கை முறை & சூழல் தூண்டுதல்கள்",
    D: "தற்போதைய முடி பராமரிப்பு & சிகிச்சைகள்",
    E: "மாதிரி சேகரிப்பு & ஒப்புதல்",
  },
  questions: {
    age_hair_loss_began: {
      question: "எந்த வயதில் முதல் முடி உதிர்வை கவனித்தீர்கள்?",
    },
    duration: {
      question: "எவ்வளவு காலமாக முடி உதிர்வு ஏற்படுகிறது?",
      options: {
        "Less than 6 months": "6 மாதங்களுக்கும் குறைவாக",
        "6-12 months": "6-12 மாதங்கள்",
        "Over a year": "ஒரு வருடத்திற்கு மேல்",
      },
    },
    family_history: {
      question: "உங்கள் குடும்பத்தில் முடி உதிர்வு உள்ளதா?",
      options: {
        "Father had hair loss": "தந்தைக்கு முடி உதிர்வு இருந்தது",
        "Mother had hair loss": "தாய்க்கு முடி உதிர்வு இருந்தது",
        "Siblings with thinning or baldness": "சகோதரர்களுக்கு thinning/baldness",
        "No known family history": "தெரியும் குடும்ப வரலாறு இல்லை",
      },
    },
    pattern: {
      question: "எந்த வகை முடி உதிர்வை கவனித்தீர்கள்?",
      options: {
        "Receding hairline": "Hairline receding",
        "Thinning at crown": "Crown-ல் thinning",
        "Widening part line": "Part line widening",
        "Diffuse thinning": "Diffuse thinning",
        "Patchy loss": "Patchy loss",
        "Sudden excessive shedding": "திடீர் excessive shedding",
      },
    },
    diagnosed_conditions: {
      question: "இந்த நிலைகளில் ஏதேனும் diagnosed ஆ?",
      options: {
        "PCOS/PCOD": "PCOS/PCOD",
        "Thyroid disorder": "Thyroid disorder",
        Diabetes: "Diabetes",
        "Autoimmune disease": "Autoimmune disease",
        Anemia: "Anemia",
        None: "எதுவும் இல்லை",
      },
    },
    menstrual_cycle: {
      question: "Menstrual cycle-ஐ எப்படி விவரிப்பீர்கள்?",
      options: {
        Regular: "Regular",
        Irregular: "Irregular",
        Menopausal: "Menopausal",
        "Not applicable": "பொருந்தாது",
      },
    },
    pregnancy_related: {
      question: "தற்போது pregnant/postpartum ஆ?",
      options: {
        "Currently pregnant": "தற்போது pregnant",
        "Postpartum <1 year": "Postpartum <1 year",
        "Not applicable": "பொருந்தாது",
      },
    },
    adult_acne_oily_skin: {
      question: "Adult acne அல்லது oily skin உள்ளதா?",
    },
    excess_body_facial_hair: {
      question: "அதிக body/facial hair உள்ளதா?",
    },
    past_6_months: {
      question: "கடந்த 6 மாதங்களில் இவற்றில் ஏதேனும்?",
      options: {
        "Crash dieting or major weight loss": "Crash dieting/major weight loss",
        "High stress or emotional trauma": "அதிக stress/emotional trauma",
        "Fever with illness (COVID, Dengue, Typhoid)":
          "Fever with illness (COVID, Dengue, Typhoid)",
        "Recent surgery": "Recent surgery",
        "Change in location/water/air quality":
          "Location/water/air quality மாற்றம்",
      },
    },
    habits: {
      question: "உங்கள் lifestyle habits பற்றி சொல்லுங்கள்",
      rows: {
        smoking: "புகைப்பீர்களா?",
        alcohol: "Alcohol குடிப்பீர்களா?",
        hard_water: "Hard water-ல் முடி கழுவுவீர்களா?",
        hair_wash_frequency: "எவ்வளவு often முடி கழுவுவீர்கள்?",
        heating_tools_styling_chemicals:
          "Heating tools/styling/chemicals பயன்படுத்துவீர்களா?",
        salon_treatments: "Salon treatments சமீபத்தில்?",
      },
      followups: {
        smoking_severity: {
          question: "ஒரு நாளில் எவ்வளவு புகை?",
          options: {
            "Mild <5/day": "Mild <5/day",
            "Moderate 5-10/day": "Moderate 5-10/day",
            "Severe >10/day": "Severe >10/day",
          },
        },
        salon_treatment_detail: {
          question: "Salon treatment-ஐ விவரிக்கவும்",
        },
      },
    },
    products: {
      question: "இந்த தயாரிப்புகளில் ஏதேனும் பயன்படுத்தியுள்ளீர்களா?",
      rows: {
        "OTC/Medicated Shampoos": "OTC/மருத்துவ ஷாம்பú",
        "Hair Oils/Serums": "முடி எண்ணெய்கள்/சீரங்கள்",
        "Topical Minoxidil": "தோலில் பூசும் மினாக்ஸிடில்",
        "Oral Minoxidil": "வாய்வழி மினாக்ஸிடில்",
        Supplements: "சத்து மாத்திரைகள்",
      },
      columns: {
        used: "பயன்படுத்தியுள்ளீர்களா?",
        duration: "எவ்வளவு காலம்?",
        helped: "உதவியா?",
        side_effects: "பக்க விளைவுகள்?",
      },
      columnOptions: {
        duration: {
          "<3mo": "3 மாதங்களுக்கும் குறைவாக",
          "3-6mo": "3–6 மாதங்கள்",
          ">6mo": "6 மாதங்களுக்கும் மேல்",
        },
      },
    },
    procedures: {
      question: "இந்த சிகிச்சைகளில் ஏதேனும் செய்துள்ளீர்களா?",
      rows: {
        "PRP/GFC/iPRF": "PRP/GFC/iPRF",
        "Stem Cells/Exosomes": "குடலிய செல்கள்/எக்சோசோம்கள்",
        "Hair Transplant": "முடி மாற்று அறுவை",
        Other: "வேறு",
      },
      columns: {
        done: "செய்துள்ளீர்களா?",
        sessions: "எத்தனை அமர்வுகள்?",
        helped: "உதவியா?",
      },
      columnOptions: {
        sessions: {
          "1-3": "1–3 அமர்வுகள்",
          "4-6": "4–6 அமர்வுகள்",
          ">6": "6-க்கும் மேல்",
        },
      },
    },
    past_treatment_side_effects: {
      question: "Past treatments-ல் side effects?",
      followups: {
        describe: {
          question: "Side effects-ஐ விவரிக்கவும்",
        },
      },
    },
    sample_type: {
      question: "எந்த sample type prefer?",
      options: {
        Saliva: "Saliva",
        Blood: "Blood",
        Either: "Either",
      },
    },
    consent: {
      question: "Sample collection & analysis-க்கு consent?",
    },
  },
};
