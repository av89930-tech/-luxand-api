export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const MODELS = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image-preview'
  ];

  const body = req.body;

  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    console.log(`Спроба ${i + 1}: модель ${model}`);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 0.7
          }
        })
      });

      const data = await response.json();
      console.log(`Модель ${model} статус: ${response.status}`);

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const hasImage = parts.some(p => p.inlineData);

      if (response.ok && hasImage) {
        console.log(`✅ Успіх від ${model}`);
        return res.status(200).json(data);
      }

      const isOverload = response.status === 429 || response.status === 503 || response.status === 500;
      const errorMsg = data?.error?.message || '';
      const isOverloadMsg = errorMsg.includes('overloaded') ||
                            errorMsg.includes('Internal error') ||
                            errorMsg.includes('UNAVAILABLE') ||
                            errorMsg.includes('Resource has been exhausted');

      if (isOverload || isOverloadMsg) {
        console.log(`⏳ ${model} перевантажена — пробуємо резервну...`);
        continue;
      }

      console.error(`❌ Помилка ${model}:`, JSON.stringify(data));
      return res.status(response.status).json(data);

    } catch (err) {
      console.error(`❌ Fetch помилка ${model}:`, err.message);
      if (i < MODELS.length - 1) continue;
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(503).json({ error: 'Всі моделі перевантажені. Спробуйте за кілька секунд.' });
}
