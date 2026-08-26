import { sql } from './_lib/db.js';
import { exigirAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      // Chamado pelo site público quando o cliente clica em
      // "Finalizar pelo WhatsApp" — grava o pedido antes de abrir o WhatsApp.
      const { itens, total } = req.body || {};
      if (!itens || total == null) {
        return res.status(400).json({ error: 'Itens e total são obrigatórios.' });
      }
      const [row] = await sql`
        INSERT INTO pedidos (itens, total) VALUES (${JSON.stringify(itens)}, ${total})
        RETURNING *
      `;
      return res.status(201).json(row);
    }

    // Listar e atualizar status exige login.
    exigirAuth(req);

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM pedidos ORDER BY criado_em DESC LIMIT 200`;
      return res.status(200).json(rows);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body || {};
      if (!id || !status) return res.status(400).json({ error: 'ID e status são obrigatórios.' });
      const [row] = await sql`UPDATE pedidos SET status = ${status} WHERE id = ${id} RETURNING *`;
      return res.status(200).json(row);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });
      await sql`DELETE FROM pedidos WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || 'Erro interno.' });
  }
}
