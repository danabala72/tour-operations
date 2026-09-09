export function normalizeLanguage(language: string | null | undefined): string {
  const value = language?.trim().toUpperCase();
  if (!value) return "EN";
  const aliases: Record<string, string> = { ITALIA: "IT", ITALIAN: "IT", ITALIANO: "IT", IT: "IT", PRANCIS: "FR", FRENCH: "FR", FRANCAIS: "FR", FR: "FR", SPANYOL: "ES", SPANISH: "ES", ESPANOL: "ES", ES: "ES", INGGRIS: "EN", ENGLISH: "EN", EN: "EN" };
  return aliases[value] ?? value;
}

export function languageFlag(language: string | null | undefined): string {
  return normalizeLanguage(language).toLowerCase() === "en" ? "gb" : normalizeLanguage(language).toLowerCase();
}
