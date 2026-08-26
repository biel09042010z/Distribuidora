-- ══════════════════════════════════════════════════════
-- CapilPro — Schema do banco (Neon Postgres)
-- Rode este arquivo inteiro uma vez no "SQL Editor" do Neon.
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS produtos (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  categoria   TEXT NOT NULL,        -- pomada | gel | shaving | barba | shampoo | alisante | descolorante | acessorios
  emoji       TEXT DEFAULT '💈',     -- usado enquanto não há foto
  imagem_url  TEXT,                 -- URL da foto do produto (opcional)
  preco       NUMERIC(10,2) NOT NULL,
  preco_antigo NUMERIC(10,2),
  desconto    TEXT,                 -- ex: "-38%"
  parcelas    TEXT,                 -- ex: "5x R$5,71"
  destaque    BOOLEAN DEFAULT false,-- mostra o selo "Top"
  ativo       BOOLEAN DEFAULT true,
  ordem       INTEGER DEFAULT 0,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kits (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  tag         TEXT,                 -- ex: "Mais Vendido", "Premium"
  icone       TEXT DEFAULT '💈',
  preco       NUMERIC(10,2) NOT NULL,
  preco_antigo NUMERIC(10,2),
  desconto    TEXT,                 -- ex: "-23%"
  itens       TEXT[],               -- lista de itens do kit
  ativo       BOOLEAN DEFAULT true,
  ordem       INTEGER DEFAULT 0,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id           SERIAL PRIMARY KEY,
  itens        JSONB NOT NULL,      -- snapshot do carrinho: [{nome, preco, qty}, ...]
  total        NUMERIC(10,2) NOT NULL,
  status       TEXT DEFAULT 'novo', -- novo | em_andamento | concluido | cancelado
  criado_em    TIMESTAMPTZ DEFAULT now()
);

-- Produtos de exemplo (o mesmo catálogo que já está no site).
-- Pode apagar e recadastrar pelo painel se preferir.
INSERT INTO produtos (nome, categoria, emoji, preco, preco_antigo, desconto, parcelas, destaque, ordem) VALUES
('Pomada Matte 150g', 'pomada', '💈', 24.99, 40.00, '-38%', '5x R$5,71', true, 1),
('Pomada Caramelo 150g', 'pomada', '🍮', 24.99, 40.00, '-38%', '5x R$5,71', false, 2),
('Pomada Incolor Extra Forte 150g', 'pomada', '💎', 24.99, 40.00, '-38%', '5x R$5,71', true, 3),
('Pomada Black Pérola Negra 150g', 'pomada', '🖤', 24.99, 40.00, '-38%', '5x R$5,71', false, 4),
('Pomada Efeito Teia 150g', 'pomada', '🕸️', 24.99, 40.00, '-38%', '5x R$5,71', false, 5),
('Gel Cola Black 1L', 'gel', '💧', 39.99, 54.00, '-26%', '4x R$11,09', true, 6),
('Gel Cola Cristal 1L', 'gel', '🫧', 36.99, 50.00, '-26%', '4x R$10,27', false, 7),
('Shaving Cream Profissional 1L', 'shaving', '🪒', 34.99, 46.00, '-24%', '4x R$9,72', true, 8),
('Shaving Gel Mentol 1L', 'shaving', '❄️', 34.99, 46.00, '-24%', '4x R$9,72', false, 9),
('Óleo para Barba Prime 30ml', 'barba', '🧔', 28.99, 40.00, '-28%', '4x R$8,06', true, 10),
('Balm para Barba 100ml', 'barba', '🧴', 32.99, 45.00, '-27%', '4x R$9,16', false, 11),
('Shampoo 3 em 1 300ml', 'shampoo', '🚿', 22.99, 32.00, '-28%', '3x R$8,33', false, 12)
ON CONFLICT DO NOTHING;

INSERT INTO kits (nome, descricao, tag, icone, preco, preco_antigo, desconto, itens, ordem) VALUES
('Kit Bancada Barbeiro', 'Tudo que sua barbearia precisa em um único pedido, com os produtos mais requisitados pelos clientes.', 'Mais Vendido', '💈', 189.99, 245.70, '-23%',
  ARRAY['3 Pomadas Modeladoras 150g','2L Shaving Cream Profissional','1 Balm para Barba 100ml','1 Óleo para Barba 30ml','1 Loção Pós-Barba 150ml'], 1),
('Kit Bancada Prime', 'Kit completo para barbearias de alto movimento. Variedade máxima, margem máxima de revenda.', 'Premium', '👑', 424.99, 750.00, '-43%',
  ARRAY['25 Pomadas Modeladoras 70g (mix)','5 Balms para Barba 100ml','6 Óleos para Barba 30ml','1 Shaving Mentol 1L','1 Shaving Cream 1L'], 2),
('Kit Barber''s Simple', 'Ideal para quem está montando a barbearia ou quer testar a linha antes de escalar o pedido.', 'Iniciante', '⚡', 149.99, 172.50, '-13%',
  ARRAY['10 Pomadas Modeladoras 70g','1 Shaving Cream 1L','1 Loção Pós-Barba 150ml','2 Óleos para Barba 30ml'], 3),
('Kit Descoloração Profissional', 'Pó descolorante de alta performance com OX incluído. Resultado superior para loiros e mechas.', 'Descoloração', '🎨', 99.98, 155.99, '-36%',
  ARRAY['Pó Descolorante 500g','Água Oxigenada 40 Vol 900ml'], 4)
ON CONFLICT DO NOTHING;
