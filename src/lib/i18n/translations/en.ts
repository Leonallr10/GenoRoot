export type TranslationDict = {
  appTitle: string;
  appSubtitle: string;
  chooseLanguage: string;
  suggestedLanguages: string;
  recommended: string;
  otherLanguages: string;
  searchLanguages: string;
  selectLanguagePlaceholder: string;
  whisperSearchHint: string;
  searchingLanguages: string;
  noLanguagesFound: string;
  reintake: string;
  translatingContent: string;
  translatingContentHint: string;
  translationLoadFailed: string;
  translationFallbackHint: string;
  autoTranslated: string;
  back: string;
  continue: string;
  startOver: string;
  startFromBeginning: string;
  welcomeBack: string;
  savedProgress: string;
  completedIntakeHint: string;
  continueToReport: string;
  language: string;
  listen: string;
  questionHelper: string;
  otherSpeak: string;
  tellUsInYourWords: string;
  tapAndSpeak: string;
  useThis: string;
  tryAgain: string;
  pauseRecording: string;
  resumeRecording: string;
  stopRecording: string;
  stopListening: string;
  pauseListening: string;
  resumeListening: string;
  transcribing: string;
  yes: string;
  no: string;
  aboutHalfway: string;
  questionOf: string;
  sectionComplete: string;
  nextSection: string;
  almostDone: string;
  reviewAnswers: string;
  reviewAloud: string;
  submitIntake: string;
  edit: string;
  intakeComplete: string;
  recordedIn: string;
  viewInEnglish: string;
  viewOriginal: string;
  downloadCsv: string;
  downloadJson: string;
  downloadExcel: string;
  download: string;
  downloadInEnglish: string;
  downloadInLanguage: string;
  preparingDownload: string;
  generateReport: string;
  generatingReport: string;
  clinicalReport: string;
  downloadReport: string;
  downloadReportPdf: string;
  downloadPdf: string;
  regenerateReport: string;
  reportFailed: string;
  viewStructuredData: string;
  comingSoon: string;
  comingSoonMessage: string;
  personalHistory: string;
  healthFactors: string;
  lifestyleTriggers: string;
  hairCareTreatments: string;
  sampleConsent: string;
  sections: Record<string, string>;
  questions: Record<
    string,
    {
      question: string;
      options?: Record<string, string>;
      rows?: Record<string, string>;
      columns?: Record<string, string>;
      columnOptions?: Record<string, Record<string, string>>;
      followups?: Record<string, { question: string; options?: Record<string, string> }>;
    }
  >;
};

export const en: TranslationDict = {
  appTitle: "GenoRoot",
  appSubtitle: "Hair & Scalp Intake",
  chooseLanguage: "Choose your language",
  suggestedLanguages: "Suggested languages",
  recommended: "recommended",
  otherLanguages: "Other languages →",
  searchLanguages: "Search languages...",
  selectLanguagePlaceholder: "Select a language",
  whisperSearchHint: "Searching languages supported by our speech model",
  searchingLanguages: "Searching...",
  noLanguagesFound: "No matching languages",
  reintake: "Re-intake",
  translatingContent: "Preparing your language…",
  translatingContentHint: "Translating questions and options. This may take a moment.",
  translationLoadFailed: "Could not load translations.",
  translationFallbackHint: "Continuing with English text. Voice input still uses your selected language.",
  autoTranslated: "Auto-translated",
  back: "Back",
  continue: "Continue",
  startOver: "Start over",
  startFromBeginning: "Start from beginning",
  welcomeBack: "Welcome back",
  savedProgress: "We saved your progress. You were on question {current} of {total}.",
  completedIntakeHint: "You finished the intake in {language}. Continue to your report or start again.",
  continueToReport: "Continue to report",
  language: "Language",
  listen: "Listen",
  questionHelper: "Choose the option that feels most comfortable for you.",
  otherSpeak: "Other",
  tellUsInYourWords: "Tell us in your own words.",
  tapAndSpeak: "Tap and start speaking",
  useThis: "Use this",
  tryAgain: "Try again",
  pauseRecording: "Pause",
  resumeRecording: "Resume",
  stopRecording: "Stop",
  stopListening: "Stop",
  pauseListening: "Pause",
  resumeListening: "Resume",
  transcribing: "Transcribing...",
  yes: "Yes",
  no: "No",
  aboutHalfway: "About halfway there",
  questionOf: "Question {current} of {total}",
  sectionComplete: "complete",
  nextSection: "Next",
  almostDone: "Almost done ✓",
  reviewAnswers: "Please review your answers.",
  reviewAloud: "Review answers aloud",
  submitIntake: "Submit intake",
  edit: "Edit",
  intakeComplete: "Intake Complete",
  recordedIn: "Your answers were recorded in {language}.",
  viewInEnglish: "View in English",
  viewOriginal: "View original answers",
  downloadCsv: "CSV",
  downloadJson: "Download JSON",
  downloadExcel: "Excel",
  download: "Download",
  downloadInEnglish: "English",
  downloadInLanguage: "{language}",
  preparingDownload: "Preparing download…",
  generateReport: "Generate clinical report",
  generatingReport: "Generating your clinical report…",
  clinicalReport: "Clinical report",
  downloadReport: "Download report",
  downloadReportPdf: "Download report PDF",
  downloadPdf: "PDF",
  regenerateReport: "Regenerate",
  reportFailed: "Could not generate the report. Please try again.",
  viewStructuredData: "View structured data",
  comingSoon: "Coming soon",
  comingSoonMessage:
    "This language is coming soon. Please choose English, Tamil, or Hindi.",
  personalHistory: "Personal history",
  healthFactors: "Health & hormonal factors",
  lifestyleTriggers: "Lifestyle & environmental triggers",
  hairCareTreatments: "Hair care & treatments",
  sampleConsent: "Sample collection & consent",
  sections: {
    A: "Personal & Family Hair Loss History",
    B: "Hormonal & Health Influences",
    C: "Lifestyle & Environmental Triggers",
    D: "Current Hair Care & Treatments",
    E: "Sample Collection & Consent",
  },
  questions: {
    age_hair_loss_began: {
      question: "At what age did you first notice hair loss?",
    },
    duration: {
      question: "How long have you been experiencing hair loss?",
      options: {
        "Less than 6 months": "Less than 6 months",
        "6-12 months": "6-12 months",
        "Over a year": "Over a year",
      },
    },
    family_history: {
      question: "Does hair loss run in your family?",
      options: {
        "Father had hair loss": "Father had hair loss",
        "Mother had hair loss": "Mother had hair loss",
        "Siblings with thinning or baldness": "Siblings with thinning or baldness",
        "No known family history": "No known family history",
      },
    },
    pattern: {
      question: "What pattern of hair loss have you noticed?",
      options: {
        "Receding hairline": "Receding hairline",
        "Thinning at crown": "Thinning at crown",
        "Widening part line": "Widening part line",
        "Diffuse thinning": "Diffuse thinning",
        "Patchy loss": "Patchy loss",
        "Sudden excessive shedding": "Sudden excessive shedding",
      },
    },
    diagnosed_conditions: {
      question: "Have you been diagnosed with any of these conditions?",
      options: {
        "PCOS/PCOD": "PCOS/PCOD",
        "Thyroid disorder": "Thyroid disorder",
        Diabetes: "Diabetes",
        "Autoimmune disease": "Autoimmune disease",
        Anemia: "Anemia",
        None: "None",
      },
    },
    menstrual_cycle: {
      question: "How would you describe your menstrual cycle?",
      options: {
        Regular: "Regular",
        Irregular: "Irregular",
        Menopausal: "Menopausal",
        "Not applicable": "Not applicable",
      },
    },
    pregnancy_related: {
      question: "Are you currently pregnant or postpartum?",
      options: {
        "Currently pregnant": "Currently pregnant",
        "Postpartum <1 year": "Postpartum <1 year",
        "Not applicable": "Not applicable",
      },
    },
    adult_acne_oily_skin: {
      question: "Do you have adult acne or oily skin?",
    },
    excess_body_facial_hair: {
      question: "Do you have excess body or facial hair?",
    },
    past_6_months: {
      question: "In the past 6 months, have you experienced any of the following?",
      options: {
        "Crash dieting or major weight loss": "Crash dieting or major weight loss",
        "High stress or emotional trauma": "High stress or emotional trauma",
        "Fever with illness (COVID, Dengue, Typhoid)":
          "Fever with illness (COVID, Dengue, Typhoid)",
        "Recent surgery": "Recent surgery",
        "Change in location/water/air quality":
          "Change in location/water/air quality",
      },
    },
    habits: {
      question: "Tell us about your lifestyle habits",
      rows: {
        smoking: "Do you smoke?",
        alcohol: "Do you drink alcohol?",
        hard_water: "Do you use hard water for washing hair?",
        hair_wash_frequency: "How often do you wash your hair?",
        heating_tools_styling_chemicals:
          "Do you use heating tools, styling products, or chemicals?",
        salon_treatments: "Have you had salon treatments recently?",
      },
      followups: {
        smoking_severity: {
          question: "How much do you smoke per day?",
          options: {
            "Mild <5/day": "Mild <5/day",
            "Moderate 5-10/day": "Moderate 5-10/day",
            "Severe >10/day": "Severe >10/day",
          },
        },
        salon_treatment_detail: {
          question: "Please describe the salon treatment",
        },
      },
    },
    products: {
      question: "Have you used any of these products?",
      rows: {
        "OTC/Medicated Shampoos": "OTC/Medicated Shampoos",
        "Hair Oils/Serums": "Hair Oils/Serums",
        "Topical Minoxidil": "Topical Minoxidil",
        "Oral Minoxidil": "Oral Minoxidil",
        Supplements: "Supplements",
      },
      columns: {
        used: "Have you used it?",
        duration: "How long?",
        helped: "Did it help?",
        side_effects: "Any side effects?",
      },
      columnOptions: {
        duration: {
          "<3mo": "Less than 3 months",
          "3-6mo": "3–6 months",
          ">6mo": "More than 6 months",
        },
      },
    },
    procedures: {
      question: "Have you had any of these procedures?",
      rows: {
        "PRP/GFC/iPRF": "PRP/GFC/iPRF",
        "Stem Cells/Exosomes": "Stem Cells/Exosomes",
        "Hair Transplant": "Hair Transplant",
        Other: "Other",
      },
      columns: {
        done: "Have you done it?",
        sessions: "How many sessions?",
        helped: "Did it help?",
      },
      columnOptions: {
        sessions: {
          "1-3": "1–3 sessions",
          "4-6": "4–6 sessions",
          ">6": "More than 6 sessions",
        },
      },
    },
    past_treatment_side_effects: {
      question: "Have you experienced side effects from past treatments?",
      followups: {
        describe: {
          question: "Please describe the side effects",
        },
      },
    },
    sample_type: {
      question: "Which sample type do you prefer?",
      options: {
        Saliva: "Saliva",
        Blood: "Blood",
        Either: "Either",
      },
    },
    consent: {
      question: "Do you consent to sample collection and analysis?",
    },
  },
};
