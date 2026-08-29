import type { TranslationDict } from "./en";
import { en } from "./en";

export const hi: TranslationDict = {
  ...en,
  appSubtitle: "बाल और खोपड़ी इनटेक",
  chooseLanguage: "अपनी भाषा चुनें",
  suggestedLanguages: "सुझाई गई भाषाएँ",
  recommended: "अनुशंसित",
  otherLanguages: "अन्य भाषाएँ →",
  searchLanguages: "भाषाएँ खोजें...",
  selectLanguagePlaceholder: "भाषा चुनें",
  whisperSearchHint: "हमारे स्पीच मॉडल द्वारा समर्थित भाषाएँ खोज रहे हैं",
  searchingLanguages: "खोज रहे हैं...",
  noLanguagesFound: "कोई मेल खाती भाषा नहीं",
  reintake: "फिर से इनटेक",
  back: "वापस",
  continue: "जारी रखें",
  startOver: "फिर से शुरू करें",
  welcomeBack: "वापसी पर स्वागत है",
  savedProgress:
    "हमने आपकी प्रगति सहेज ली है। आप प्रश्न {current} / {total} पर थे।",
  language: "भाषा",
  listen: "सुनें",
  questionHelper: "वह विकल्प चुनें जो आपको सबसे सहज लगे।",
  otherSpeak: "अन्य 🎤",
  tellUsInYourWords: "अपने शब्दों में बताएं।",
  tapAndSpeak: "टैप करें और बोलना शुरू करें",
  useThis: "इसे उपयोग करें",
  tryAgain: "फिर से कोशिश करें",
  yes: "हाँ",
  no: "नहीं",
  aboutHalfway: "लगभग आधा रास्ता",
  questionOf: "प्रश्न {current} / {total}",
  sectionComplete: "पूर्ण",
  nextSection: "अगला",
  almostDone: "लगभग हो गया ✓",
  reviewAnswers: "कृपया अपने उत्तरों की समीक्षा करें।",
  reviewAloud: "उत्तर ज़ोर से सुनें",
  submitIntake: "इनटेक जमा करें",
  edit: "संपादित करें",
  intakeComplete: "इनटेक पूर्ण",
  recordedIn: "आपके उत्तर {language} में दर्ज किए गए।",
  viewInEnglish: "अंग्रेज़ी में देखें",
  viewOriginal: "मूल उत्तर देखें",
  viewStructuredData: "Structured data देखें",
  comingSoon: "जल्द आ रहा है",
  comingSoonMessage:
    "यह भाषा जल्द उपलब्ध होगी। कृपया अंग्रेज़ी, तमिल या हिंदी चुनें।",
  personalHistory: "व्यक्तिगत इतिहास",
  healthFactors: "स्वास्थ्य और हार्मोनल कारक",
  lifestyleTriggers: "जीवनशैली और पर्यावरणीय ट्रिगर",
  hairCareTreatments: "बाल देखभाल और उपचार",
  sampleConsent: "नमूना संग्रह और सहमति",
  sections: {
    A: "व्यक्तिगत और पारिवारिक बाल झड़ने का इतिहास",
    B: "हार्मोनल और स्वास्थ्य प्रभाव",
    C: "जीवनशैली और पर्यावरणीय ट्रिगर",
    D: "वर्तमान बाल देखभाल और उपचार",
    E: "नमूना संग्रह और सहमति",
  },
  questions: {
    age_hair_loss_began: {
      question: "आपको पहली बार बाल झड़ना किस उम्र में दिखा?",
    },
    duration: {
      question: "आपको बाल झड़ने की समस्या कितने समय से है?",
      options: {
        "Less than 6 months": "6 महीने से कम",
        "6-12 months": "6-12 महीने",
        "Over a year": "एक साल से अधिक",
      },
    },
    family_history: {
      question: "क्या आपके परिवार में बाल झड़ने की समस्या है?",
      options: {
        "Father had hair loss": "पिता को बाल झड़ने की समस्या थी",
        "Mother had hair loss": "माता को बाल झड़ने की समस्या थी",
        "Siblings with thinning or baldness":
          "भाई-बहनों में पतले बाल या गंजापन",
        "No known family history": "कोई ज्ञात पारिवारिक इतिहास नहीं",
      },
    },
    pattern: {
      question: "आपने किस प्रकार का बाल झड़ना देखा है?",
      options: {
        "Receding hairline": "पीछे हटती हेयरलाइन",
        "Thinning at crown": "सir पर पतले बाल",
        "Widening part line": "विभाजन रेखा चौड़ी होना",
        "Diffuse thinning": "व्यापक पतले बाल",
        "Patchy loss": "धब्बेदार झड़ना",
        "Sudden excessive shedding": "अचानक अत्यधिक झड़ना",
      },
    },
    diagnosed_conditions: {
      question: "क्या आपको इनमें से कोई स्थिति निदान हुई है?",
      options: {
        "PCOS/PCOD": "PCOS/PCOD",
        "Thyroid disorder": "thyroid disorder",
        Diabetes: "मधुमेह",
        "Autoimmune disease": "autoimmune disease",
        Anemia: "एनीमिया",
        None: "कोई नहीं",
      },
    },
    menstrual_cycle: {
      question: "आप अपने मासिक चक्र को कैसे वर्णित करेंगे?",
      options: {
        Regular: "नियमित",
        Irregular: "अनियमित",
        Menopausal: "मेनोपॉज़",
        "Not applicable": "लागू नहीं",
      },
    },
    pregnancy_related: {
      question: "क्या आप वर्तमान में गर्भवती या प्रसवोत्तर हैं?",
      options: {
        "Currently pregnant": "वर्तमान में गर्भवती",
        "Postpartum <1 year": "प्रसवोत्तर <1 वर्ष",
        "Not applicable": "लागू नहीं",
      },
    },
    adult_acne_oily_skin: {
      question: "क्या आपको वयस्क मुंहासे या तैलीय त्वचा है?",
    },
    excess_body_facial_hair: {
      question: "क्या आपके शरीर या चेहरे पर अतिरिक्त बाल हैं?",
    },
    past_6_months: {
      question: "पिछले 6 महीनों में, क्या आपने इनमें से कुछ अनुभव किया?",
      options: {
        "Crash dieting or major weight loss":
          "क्रैश डाइटिंग या बड़ा वजन घटना",
        "High stress or emotional trauma":
          "उच्च तनाव या भावनात्मक आघात",
        "Fever with illness (COVID, Dengue, Typhoid)":
          "बीमारी के साथ बुखार (COVID, Dengue, Typhoid)",
        "Recent surgery": "हाल की सर्जरी",
        "Change in location/water/air quality":
          "स्थान/पानी/हवा की गुणवत्ता में बदलाव",
      },
    },
    habits: {
      question: "अपनी जीवनशैली की आदतों के बारे में बताएं",
      rows: {
        smoking: "क्या आप धूम्रपान करते हैं?",
        alcohol: "क्या आप शराब पीते हैं?",
        hard_water: "क्या आप बाल धोने के लिए कठोर पानी का उपयोग करते हैं?",
        hair_wash_frequency: "आप कितनी बार बाल धोते हैं?",
        heating_tools_styling_chemicals:
          "क्या आप हीटिंग टूल, स्टाइलिंग या रसायन का उपयोग करते हैं?",
        salon_treatments: "क्या हाल ही में salon treatments हुए?",
      },
      followups: {
        smoking_severity: {
          question: "आप प्रतिदिन कितना धूम्रपान करते हैं?",
          options: {
            "Mild <5/day": "हल्का <5/दिन",
            "Moderate 5-10/day": "मध्यम 5-10/दिन",
            "Severe >10/day": "गंभीर >10/दिन",
          },
        },
        salon_treatment_detail: {
          question: "कृपया salon treatment का वर्णन करें",
        },
      },
    },
    products: {
      question: "क्या आपने इनमें से कोई उत्पाद उपयोग किया है?",
      rows: {
        "OTC/Medicated Shampoos": "OTC/दवा वाले शैंपू",
        "Hair Oils/Serums": "बाल तेल/सीरम",
        "Topical Minoxidil": "त्वचा पर लगाने वाला मिनॉक्सिडिल",
        "Oral Minoxidil": "मुँह से लेने वाला मिनॉक्सिडिल",
        Supplements: "सप्लीमेंट्स",
      },
      columns: {
        used: "क्या उपयोग किया?",
        duration: "कितने समय?",
        helped: "क्या मदद मिली?",
        side_effects: "कोई दुष्प्रभाव?",
      },
      columnOptions: {
        duration: {
          "<3mo": "3 महीने से कम",
          "3-6mo": "3–6 महीने",
          ">6mo": "6 महीने से अधिक",
        },
      },
    },
    procedures: {
      question: "क्या आपने इनमें से कोई प्रक्रिया करवाई है?",
      rows: {
        "PRP/GFC/iPRF": "PRP/GFC/iPRF",
        "Stem Cells/Exosomes": "स्टेम सेल/एक्सोसोम",
        "Hair Transplant": "बाल प्रत्यारोपण",
        Other: "अन्य",
      },
      columns: {
        done: "क्या किया?",
        sessions: "कितने सत्र?",
        helped: "क्या मदद मिली?",
      },
      columnOptions: {
        sessions: {
          "1-3": "1–3 सत्र",
          "4-6": "4–6 सत्र",
          ">6": "6 से अधिक",
        },
      },
    },
    past_treatment_side_effects: {
      question: "क्या past treatments से side effects हुए?",
      followups: {
        describe: {
          question: "कृपया side effects का वर्णन करें",
        },
      },
    },
    sample_type: {
      question: "आप कौन सा sample type prefer करते हैं?",
      options: {
        Saliva: "Saliva",
        Blood: "Blood",
        Either: "Either",
      },
    },
    consent: {
      question: "क्या आप sample collection और analysis के लिए सहमति देते हैं?",
    },
  },
};
