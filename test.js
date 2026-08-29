/**
 * Translation smoke test for GenoRoot.
 *
 * Usage:
 *   node test.js                 # test all supported languages (HF direct)
 *   node test.js --lang ta       # test one language
 *   node test.js --local         # hit http://localhost:3000/api/translate
 *   node test.js --local --lang hi de
 *
 * Requires HF_TOKEN in .env (or environment) for direct HF tests.
 * For --local, run `npm run dev` first.
 */

const fs = require("fs");
const path = require("path");

const HF_INFERENCE_BASE =
  process.env.HF_INFERENCE_BASE ??
  "https://router.huggingface.co/hf-inference/models";

const MBART_MODEL = "facebook/mbart-large-50-many-to-many-mmt";

const MBART_MAP = {
  en: "en_XX",
  de: "de_DE",
  fr: "fr_XX",
  es: "es_XX",
  hi: "hi_IN",
  ta: "ta_IN",
  te: "te_IN",
  bn: "bn_IN",
  gu: "gu_IN",
  mr: "mr_IN",
  ne: "ne_IN",
  si: "si_IN",
  ur: "ur_IN",
  ar: "ar_AR",
  zh: "zh_CN",
  ja: "ja_XX",
  ko: "ko_KR",
  ru: "ru_RU",
  pt: "pt_XX",
  it: "it_IT",
  nl: "nl_XX",
  pl: "pl_PL",
  tr: "tr_TR",
  vi: "vi_VN",
  th: "th_TH",
  id: "id_ID",
  ms: "ms_MY",
  fa: "fa_IR",
  he: "he_IL",
  uk: "uk_UA",
  cs: "cs_CZ",
  ro: "ro_RO",
  fi: "fi_FI",
  sv: "sv_SE",
  da: "da_DK",
  no: "no_NO",
  hu: "hu_HU",
  el: "el_GR",
  bg: "bg_BG",
  hr: "hr_HR",
  sk: "sk_SK",
  sl: "sl_SI",
  lt: "lt_LT",
  lv: "lv_LV",
  et: "et_EE",
  af: "af_ZA",
  sw: "sw_KE",
  ml: "ml_IN",
  kn: "kn_IN",
  pa: "pa_IN",
  ps: "ps_AF",
  km: "km_KH",
  my: "my_MM",
  tl: "tl_XX",
  gl: "gl_ES",
  ka: "ka_GE",
  kk: "kk_KZ",
  mn: "mn_MN",
  az: "az_AZ",
  hy: "hy_AM",
  be: "be_BY",
  mk: "mk_MK",
  sq: "sq_AL",
  bs: "bs_BA",
  sr: "sr_RS",
  is: "is_IS",
  mt: "mt_MT",
  cy: "cy_GB",
  eu: "eu_ES",
  ca: "ca_ES",
};

const OPUS_FROM_ENGLISH = {
  ta: "Helsinki-NLP/opus-mt-en-ta",
  hi: "Helsinki-NLP/opus-mt-en-hi",
  de: "Helsinki-NLP/opus-mt-en-de",
};

const OPUS_TO_ENGLISH = {
  ta: "Helsinki-NLP/opus-mt-ta-en",
  hi: "Helsinki-NLP/opus-mt-hi-en",
  de: "Helsinki-NLP/opus-mt-de-en",
};

const SAMPLE_EN = "Choose your language";
const SAMPLE_EN_LONG = "Hair and scalp intake — question 1 of 16";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = { local: false, langs: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--local") {
      args.local = true;
    } else if (arg === "--lang") {
      args.langs = [];
      while (argv[i + 1] && !argv[i + 1].startsWith("--")) {
        args.langs.push(argv[++i]);
      }
    }
  }
  return args;
}

function modelUrl(model) {
  return `${HF_INFERENCE_BASE}/${model}`;
}

async function parseTranslationResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    return { ok: false, error: `Non-JSON response (${response.status})` };
  }

  const result = await response.json();
  if (Array.isArray(result) && typeof result[0]?.translation_text === "string") {
    return { ok: true, text: result[0].translation_text };
  }
  if (typeof result?.translation_text === "string") {
    return { ok: true, text: result.translation_text };
  }
  if (typeof result?.generated_text === "string") {
    return { ok: true, text: result.generated_text };
  }
  if (typeof result?.error === "string") {
    return { ok: false, error: result.error };
  }
  return { ok: false, error: "Unknown response shape" };
}

async function callHfModel(token, model, inputs, parameters) {
  const response = await fetch(modelUrl(model), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters ? { inputs, parameters } : { inputs }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      ok: false,
      error: `HF ${model} ${response.status}: ${errText.slice(0, 180)}`,
    };
  }

  const parsed = await parseTranslationResponse(response);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error ?? "Parse failed", model };
  }
  return { ok: true, text: parsed.text, model };
}

async function translateDirect(token, text, sourceLang, targetLang) {
  if (sourceLang === targetLang) {
    return { ok: true, text, model: "noop" };
  }

  let translated = null;
  let modelUsed = null;
  let lastError = null;

  try {
    if (sourceLang === "en" && OPUS_FROM_ENGLISH[targetLang]) {
      const opus = await callHfModel(
        token,
        OPUS_FROM_ENGLISH[targetLang],
        text
      );
      if (opus.ok) {
        translated = opus.text;
        modelUsed = opus.model;
      } else {
        lastError = opus.error;
      }
    } else if (targetLang === "en" && OPUS_TO_ENGLISH[sourceLang]) {
      const opus = await callHfModel(token, OPUS_TO_ENGLISH[sourceLang], text);
      if (opus.ok) {
        translated = opus.text;
        modelUsed = opus.model;
      } else {
        lastError = opus.error;
      }
    }
  } catch (err) {
    lastError = String(err);
  }

  const src = MBART_MAP[sourceLang];
  const tgt = MBART_MAP[targetLang];

  if (!translated && src && tgt) {
    const mbart = await callHfModel(token, MBART_MODEL, text, {
      src_lang: src,
      tgt_lang: tgt,
    });
    if (mbart.ok) {
      translated = mbart.text;
      modelUsed = mbart.model;
    } else {
      lastError = mbart.error;
    }
  }

  if (!translated) {
    return { ok: false, error: lastError ?? "No translation returned" };
  }

  if (targetLang !== "en" && translated.trim() === text.trim()) {
    return {
      ok: false,
      error: "Returned same text as input",
      model: modelUsed,
      text: translated,
    };
  }

  return { ok: true, text: translated, model: modelUsed };
}

async function translateLocal(baseUrl, text, language, direction) {
  const response = await fetch(`${baseUrl}/api/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, direction }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      error: body.error ?? response.statusText,
      details: body.details,
    };
  }

  return { ok: true, text: body.translation };
}

function pad(value, width) {
  return String(value).padEnd(width);
}

async function testLanguage(lang, options) {
  const results = [];

  if (options.local) {
    const toTarget = await translateLocal(
      options.baseUrl,
      SAMPLE_EN,
      lang,
      "fromEnglish"
    );
    results.push({
      direction: "en→" + lang,
      ...toTarget,
    });

    if (toTarget.ok && toTarget.text) {
      const toEnglish = await translateLocal(
        options.baseUrl,
        toTarget.text,
        lang,
        "toEnglish"
      );
      results.push({
        direction: lang + "→en",
        ...toEnglish,
      });
    }

    return results;
  }

  const toTarget = await translateDirect(
    options.token,
    SAMPLE_EN,
    "en",
    lang
  );
  results.push({ direction: "en→" + lang, ...toTarget });

  if (toTarget.ok && toTarget.text) {
    const toEnglish = await translateDirect(
      options.token,
      toTarget.text,
      lang,
      "en"
    );
    results.push({ direction: lang + "→en", ...toEnglish });
  }

  const long = await translateDirect(
    options.token,
    SAMPLE_EN_LONG,
    "en",
    lang
  );
  results.push({ direction: "en→" + lang + " (long)", ...long });

  return results;
}

async function main() {
  loadEnvFile(path.join(__dirname, ".env"));
  loadEnvFile(path.join(__dirname, ".env.local"));

  const args = parseArgs(process.argv);
  const langs = args.langs ?? Object.keys(MBART_MAP).filter((code) => code !== "en");
  const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";

  if (!args.local && !process.env.HF_TOKEN) {
    console.error("Missing HF_TOKEN. Add it to .env or run with --local while dev server is up.");
    process.exit(1);
  }

  console.log(
    args.local
      ? `Testing via ${baseUrl}/api/translate`
      : `Testing via Hugging Face (${HF_INFERENCE_BASE})`
  );
  console.log(`Languages: ${langs.length}\n`);

  const summary = { pass: 0, fail: 0, failures: [] };

  for (const lang of langs) {
    if (!MBART_MAP[lang] && lang !== "en") {
      console.log(`${pad(lang, 6)} SKIP (no mBART mapping)`);
      continue;
    }

    process.stdout.write(`${pad(lang, 6)} `);
    const results = await testLanguage(lang, {
      local: args.local,
      baseUrl,
      token: process.env.HF_TOKEN,
    });

    const failed = results.filter((r) => !r.ok);
    if (failed.length === 0) {
      summary.pass += 1;
      const sample = results.find((r) => r.direction.startsWith("en→") && r.text);
      console.log(`OK  ${sample?.text?.slice(0, 60) ?? ""}`);
    } else {
      summary.fail += 1;
      console.log("FAIL");
      for (const result of failed) {
        console.log(`       ${result.direction}: ${result.error ?? result.details ?? "unknown"}`);
        summary.failures.push({ lang, ...result });
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log("\n--- Summary ---");
  console.log(`Passed languages: ${summary.pass}`);
  console.log(`Failed languages: ${summary.fail}`);
  if (summary.failures.length > 0) {
    console.log("\nFailures:");
    for (const failure of summary.failures) {
      console.log(
        `- ${failure.lang} ${failure.direction}: ${failure.error ?? failure.details}`
      );
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
