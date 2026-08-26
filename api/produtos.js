import { sql } from './_lib/db.js';
import { exigirAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Lista pública — o próprio site (index.html) pode usar esta rota
      // para carregar os produtos, se você quiser trocar o catálogo fixo
      // em JS por dados vindos do banco.
      const rows = await sql`
        SELECT * FROM produtos WHERE ativo = true ORDER BY ordem ASC, id ASC
      `;
      return res.status(200).json(rows);
    }

    // Todas as rotas abaixo exigem login.
    exigirAuth(req);

    if (req.method === 'POST') {
      const p = req.body || {};
      if (!p.nome || !p.categoria || p.preco == null) {
        return res.status(400).json({ error: 'Nome, categoria e preço são obrigatórios.' });
      }
      const [row] = await sql`
        INSERT INTO produtos
          (nome, categoria, emoji, imagem_url, preco, preco_antigo, desconto, parcelas, destaque, ordem)
        VALUES
          (${p.nome}, ${p.categoria}, ${p.emoji || '💈'}, ${p.imagem_url || null},
           ${p.preco}, ${p.preco_antigo || null}, ${p.desconto || null}, ${p.parcelas || null},
           ${!!p.destaque}, ${p.ordem || 0})
        RETURNING *
      `;
      return res.status(201).json(row);
    }

    if (req.method === 'PUT') {
      const p = req.body || {};
      if (!p.id) return res.status(400).json({ error: 'ID é obrigatório.' });
      const [row] = await sql`
        UPDATE produtos SET
          nome = ${p.nome}, categoria = ${p.categoria}, emoji = ${p.emoji || '💈'},
          imagem_url = ${p.imagem_url || null}, preco = ${p.preco},
          preco_antigo = ${p.preco_antigo || null}, desconto = ${p.desconto || null},
          parcelas = ${p.parcelas || null}, destaque = ${!!p.destaque}
        WHERE id = ${p.id}
        RETURNING *
      `;
      return res.status(200).json(row);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });
      await sql`DELETE FROM produtos WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || 'Erro interno.' });
  }
}
