export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { photoBase64, fabricBase64, fabricName } = req.body;
  if (!photoBase64) return res.status(400).json({ error: 'photo required' });

  const hasFabric = !!fabricBase64;

  const prompt = hasFabric
    ? `CRITICAL TASK: Reupholster the furniture in Image 1 using the EXACT fabric shown in Image 2 (named "${fabricName || 'selected fabric'}").
REQUIREMENTS:
- The fabric color MUST match Image 2 EXACTLY.
- Match the fabric texture, weave, and pattern from Image 2 precisely.
- Keep the furniture shape, legs, cushions and proportions from Image 1 identical.
- Only the upholstery material changes - everything else stays the same.
- Keep the same background, lighting and camera angle as Image 1.
- Do NOT add watermarks, text, or labels.
Generate the photorealistic image, then in Ukrainian write 2-3 sentences describing how the furniture looks in this new fabric.`
    : `Reupholster this furniture using fabric "${fabricName || 'selected fabric'}". Match the fabric name color and texture. Keep furniture shape identical. No watermarks. Then in Ukrainian write 2-3 sentences about the result.`;

  const parts = [
    { text: prompt },
    { inline_data: { mime_type: 'image/jpeg', data: photoBase64 } }
  ];

  if (hasFabric) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: fabricBase64 } });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          temperature: 0.7
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    // Extract image and text
    let text = '';
    let imageBase64 = '';
    for (const part of data.candidates[0].content.parts) {
      if (part.text) text += part.text;
      if (part.inlineData) imageBase64 = part.inlineData.data;
    }

    return res.status(200).json({ imageBase64, text });

  } catch (err) {
    console.error('Visualize error:', err);
    return res.status(500).json({ error: err.message });
  }
}
  }
}
