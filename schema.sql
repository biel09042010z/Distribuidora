-- ══════════════════════════════════════════════════════
-- CapilPro — Schema do banco (Neon Postgres)
-- Rode este arquivo inteiro uma vez no "SQL Editor" do Neon.
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS produtos (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  marca       TEXT NOT NULL DEFAULT 'classe-a', -- classe-a | fox
  categoria   TEXT NOT NULL,
  emoji       TEXT DEFAULT '💈',
  imagem_url  TEXT,
  preco       NUMERIC(10,2) NOT NULL,
  preco_antigo NUMERIC(10,2),
  desconto    TEXT,
  parcelas    TEXT,
  destaque    BOOLEAN DEFAULT false,
  ativo       BOOLEAN DEFAULT true,
  ordem       INTEGER DEFAULT 0,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- Se a tabela já existia, adiciona a coluna marca sem recriar:
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS marca TEXT NOT NULL DEFAULT 'classe-a';

CREATE TABLE IF NOT EXISTS kits (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  tag         TEXT,
  icone       TEXT DEFAULT '💈',
  preco       NUMERIC(10,2) NOT NULL,
  preco_antigo NUMERIC(10,2),
  desconto    TEXT,
  itens       TEXT[],
  ativo       BOOLEAN DEFAULT true,
  ordem       INTEGER DEFAULT 0,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id           SERIAL PRIMARY KEY,
  itens        JSONB NOT NULL,
  total        NUMERIC(10,2) NOT NULL,
  status       TEXT DEFAULT 'novo',
  criado_em    TIMESTAMPTZ DEFAULT now()
);
