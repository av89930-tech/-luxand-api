import { kv } from '@vercel/kv';

const VALID_CODES = [
  "08NU","G0Z4","93CD","0WK7","9GG4","4CX4","OI92","F23H","N10Q","4PX0",
  "CS31","GW43","9E1X","SC62","8MP2","N8G8","WA19","8ZC0","76GM","RO89",
  "86XF","71QO","O05S","7BR7","SD99","Q4B8","F6D1","OY65","W9C7","3Q6P",
  "TJ33","MC45","7ZI7","DI59","BE32","R4X0","9J0E","J4O6","S3C5","5N8L",
  "T27Q","O13U","4UR9","0W5H","YN93","6CR8","H1Q5","XV45","8M2P","P86O",
  "0Z2R","SR20","34NW","5K9J","5ZK8","3Y6E","H01W","B0V5","66IQ","1DS5",
  "J86T","98GK","AT93","O7J6","6O7B","UK94","U72T","9V3N","O1A5","9B2K",
  "2A0O","00FR","2J1Z","8D9L","Y90F","03CD","RP70","CU86","3P1Y","N1M8",
  "E1S3","88OV","47MB","09FZ","C42P","D8M6","MW45","BZ31","53JP","52QC",
  "Y5W2","11VE","2OP9","2L6K","6U0E","EV04","4KS6","46MH","YB41","4B8S"
];

const MAX_USES = 5;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'luxand-admin-2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Проста авторизація через query param
  const { secret, code: resetCode, action } = req.query;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Скинути конкретний код
  if (action === 'reset' && resetCode) {
    await kv.set(`code:${resetCode.toUpperCase()}`, 0);
    return res.status(200).json({ ok: true, message: `Code ${resetCode} reset to 0` });
  }

  // Показати статистику всіх кодів
  const keys = VALID_CODES.map(c => `code:${c}`);
  const values = await kv.mget(...keys);

  const stats = VALID_CODES.map((code, i) => ({
    code,
    uses: Number(values[i] || 0),
    remaining: Math.max(0, MAX_USES - Number(values[i] || 0)),
    blocked: Number(values[i] || 0) >= MAX_USES
  }));

  const summary = {
    total: stats.length,
    active: stats.filter(s => !s.blocked).length,
    blocked: stats.filter(s => s.blocked).length,
    used: stats.filter(s => s.uses > 0).length,
    unused: stats.filter(s => s.uses === 0).length,
  };

  return res.status(200).json({ summary, codes: stats });
}
