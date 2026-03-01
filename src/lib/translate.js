const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY;
const LANGS = ["de", "es", "fr", "it"];

export async function translateText(text, targetLang) {
  if (!API_KEY || !text) return text;
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: targetLang, format: "text" }),
    }
  );
  if (!res.ok) throw new Error(`Translation failed: ${res.status}`);
  const data = await res.json();
  return data.data.translations[0].translatedText;
}

export async function translateFaq(question, answer) {
  if (!API_KEY) return {};
  const results = await Promise.all(
    LANGS.map(async (lang) => {
      const [q, a] = await Promise.all([
        translateText(question, lang),
        translateText(answer, lang),
      ]);
      return { [`question_${lang}`]: q, [`answer_${lang}`]: a };
    })
  );
  return Object.assign({}, ...results);
}
