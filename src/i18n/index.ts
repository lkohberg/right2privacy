import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";
import { SUPPORTED_CODES } from "./languages";

const resources = Object.fromEntries(
  Object.entries(translations).map(([code, dict]) => [code, { translation: dict }]),
);

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs: SUPPORTED_CODES,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
}

export { i18n };
export default i18n;