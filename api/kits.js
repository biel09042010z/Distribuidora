import { sql } from './_lib/db.js';
import { exigirAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM kits WHERE ativo = true ORDER BY ordem ASC, id ASC
      `;
      return res.status(200).json(rows);
    }

    exigirAuth(req);

    if (req.method === 'POST') {
      const k = req.body || {};
      if (!k.nome || k.preco == null) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
      }
      const [row] = await sql`
        INSERT INTO kits
          (nome, descricao, tag, icone, preco, preco_antigo, desconto, itens, ordem)
        VALUES
          (${k.nome}, ${k.descricao || null}, ${k.tag || null}, ${k.icone || '💈'},
           ${k.preco}, ${k.preco_antigo || null}, ${k.desconto || null},
           ${k.itens || []}, ${k.ordem || 0})
        RETURNING *
      `;
      return res.status(201).json(row);
    }

    if (req.method === 'PUT') {
      const k = req.body || {};
      if (!k.id) return res.status(400).json({ error: 'ID é obrigatório.' });
      const [row] = await sql`
        UPDATE kits SET
          nome = ${k.nome}, descricao = ${k.descricao || null}, tag = ${k.tag || null},
          icone = ${k.icone || '💈'}, preco = ${k.preco}, preco_antigo = ${k.preco_antigo || null},
          desconto = ${k.desconto || null}, itens = ${k.itens || []}
        WHERE id = ${k.id}
        RETURNING *
      `;
      return res.status(200).json(row);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });
      await sql`DELETE FROM kits WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || 'Erro interno.' });
  }
}
