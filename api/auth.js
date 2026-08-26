// Autenticação simples por token assinado (HMAC-SHA256), sem
// dependências externas. O login (e-mail/senha) é conferido contra as
// variáveis de ambiente ADMIN_EMAIL e ADMIN_PASSWORD — configure as
// duas na Vercel (Project Settings → Environment Variables).
import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'troque-este-segredo';
const EXPIRA_EM_MS = 12 * 60 * 60 * 1000; // 12 horas

export function gerarToken(email) {
  const payload = JSON.stringify({ email, exp: Date.now() + EXPIRA_EM_MS });
  const b64 = Buffer.from(payload).toString('base64url');
  const assinatura = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
  return `${b64}.${assinatura}`;
}

export function verificarToken(token) {
  if (!token) return null;
  const [b64, assinatura] = token.split('.');
  if (!b64 || !assinatura) return null;
  const esperado = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
  if (assinatura !== esperado) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Usado no início de cada endpoint protegido.
export function exigirAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verificarToken(token);
  if (!payload) {
    const err = new Error('Não autorizado.');
    err.status = 401;
    throw err;
  }
  return payload;
}
