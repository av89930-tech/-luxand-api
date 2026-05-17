const MAX_USES = 5;

const VALID_CODES = new Set([
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
]);

async function redisIncr(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const res = await fetch(`${url}/incr/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ ok: false, reason: 'no_code' });

  const normalized = String(code).trim().toUpperCase();

  if (!VALID_CODES.has(normalized)) {
    return res.status(200).json({ ok: false, reason: 'invalid' });
  }

  try {
    const count = await redisIncr(`code:${normalized}`);

    if (count > MAX_USES) {
      return res.status(200).json({
        ok: false,
        reason: 'used_up',
        uses: count - 1,
        max: MAX_USES
      });
    }

    return res.status(200).json({
      ok: true,
      uses: count,
      remaining: MAX_USES - count
    });

  } catch (err) {
    console.error('Redis error:', err);
    return res.status(500).json({ ok: false, reason: 'server_error' });
  }
}
