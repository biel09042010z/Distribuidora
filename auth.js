// api/auth.js — endpoint HTTP de login
import crypto from 'crypto';

const SECRET   = process.env.AUTH_SECRET    || 'troque-este-segredo';
const EMAIL    = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const EXPIRA   = 12 * 60 * 60 * 1000; // 12h

const USUARIOS = [
  { email: EMAIL, password: PASSWORD },
  { email: 'Alvinosanches@outlook.com', password: 'Miguel@56' },
];

function gerarToken(email) {
  const payload = JSON.stringify({ email, exp: Date.now() + EXPIRA });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig  = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verificarToken(token) {
  if (!token) return null;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  const esperado = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
  if (sig !== esperado) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export function exigirAuth(req) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verificarToken(token);
  if (!payload) {
    const err = new Error('Não autorizado.');
    err.status = 401;
    throw err;
  }
  return payload;
}

// ── Handler HTTP ──────────────────────────────────────
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { email, password } = req.body || {};

  if (!EMAIL || !PASSWORD) {
    return res.status(500).json({ error: 'Variáveis de ambiente não configuradas.' });
  }

  const usuario = USUARIOS.find(u => u.email === email && u.password === password);
  if (!usuario) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  return res.status(200).json({ token: gerarToken(email), email });
}
