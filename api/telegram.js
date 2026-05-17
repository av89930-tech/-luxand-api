export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, data } = req.body;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    if (action === 'sendMessage') {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: data.text
        })
      });
      const result = await response.json();
      return res.status(200).json(result);
    }

    if (action === 'sendPhoto') {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      
      // Convert base64 to blob
      const base64Data = data.photo.split(',')[1] || data.photo;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      formData.append('photo', blob, 'photo.jpg');
      if (data.caption) formData.append('caption', data.caption);

      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Telegram API error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
