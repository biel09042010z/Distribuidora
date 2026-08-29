import { sql } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { itens } = req.body || {};
    if (!Array.isArray(itens) || !itens.length) {
      return res.status(400).json({ error: 'Lista de itens inválida.' });
    }

    const atualizados = [];

    for (const item of itens) {
      const id = Number(item.id);
      const qty = Number(item.qty);
      if (!id || !qty || qty <= 0) continue;

      // Desconta apenas se tiver estoque suficiente (nunca vai abaixo de 0)
      const [row] = await sql`
        UPDATE produtos
        SET estoque = GREATEST(estoque - ${qty}, 0)
        WHERE id = ${id}
        RETURNING id, estoque
      `;

      if (row) atualizados.push(row);
    }

    return res.status(200).json({ ok: true, atualizados });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erro interno.' });
  }
}
