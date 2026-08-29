/** Languages with hand-written translation files (no live API needed). */
export const STATIC_TRANSLATION_CODES = ["en"] as const;

export type StaticTranslationCode = (typeof STATIC_TRANSLATION_CODES)[number];

export function hasStaticTranslations(lang: string): boolean {
  return (STATIC_TRANSLATION_CODES as readonly string[]).includes(lang);
}
