// EU official languages (24) + English as default.
// Keep in alphabetical order by nativeName; English first.
export const LANGUAGES: { code: string; nativeName: string; englishName: string }[] = [
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "bg", nativeName: "Български", englishName: "Bulgarian" },
  { code: "hr", nativeName: "Hrvatski", englishName: "Croatian" },
  { code: "cs", nativeName: "Čeština", englishName: "Czech" },
  { code: "da", nativeName: "Dansk", englishName: "Danish" },
  { code: "nl", nativeName: "Nederlands", englishName: "Dutch" },
  { code: "et", nativeName: "Eesti", englishName: "Estonian" },
  { code: "fi", nativeName: "Suomi", englishName: "Finnish" },
  { code: "fr", nativeName: "Français", englishName: "French" },
  { code: "de", nativeName: "Deutsch", englishName: "German" },
  { code: "el", nativeName: "Ελληνικά", englishName: "Greek" },
  { code: "hu", nativeName: "Magyar", englishName: "Hungarian" },
  { code: "ga", nativeName: "Gaeilge", englishName: "Irish" },
  { code: "it", nativeName: "Italiano", englishName: "Italian" },
  { code: "lv", nativeName: "Latviešu", englishName: "Latvian" },
  { code: "lt", nativeName: "Lietuvių", englishName: "Lithuanian" },
  { code: "mt", nativeName: "Malti", englishName: "Maltese" },
  { code: "pl", nativeName: "Polski", englishName: "Polish" },
  { code: "pt", nativeName: "Português", englishName: "Portuguese" },
  { code: "ro", nativeName: "Română", englishName: "Romanian" },
  { code: "sk", nativeName: "Slovenčina", englishName: "Slovak" },
  { code: "sl", nativeName: "Slovenščina", englishName: "Slovenian" },
  { code: "es", nativeName: "Español", englishName: "Spanish" },
  { code: "sv", nativeName: "Svenska", englishName: "Swedish" },
];

export const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);