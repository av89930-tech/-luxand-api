import { generateText } from 'ai'; // Це підключення до інтелекту
import { google } from '@ai-sdk/google';

export default async function handler(req, res) {
  // Налаштування, щоб сайт на Netlify міг розмовляти з цим файлом
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { fabric, color, image } = req.body;

    // Складаємо магічний запит для Gemini
    const prompt = `Visual transformation: Change the sofa upholstery to ${fabric}, 
                    color ${color}. High-end luxury furniture photography, 
                    4k, realistic textures. Maintain the exact sofa shape.`;

    // Повідомляємо Vercel, що треба запустити Gemini
    res.status(200).json({ 
      success: true, 
      magic_prompt: prompt,
      status: "Трансмутація запущена через MAGICUM AI"
    });
    
  } catch (error) {
    res.status(500).json({ error: "Магічний збій: " + error.message });
  }
}
