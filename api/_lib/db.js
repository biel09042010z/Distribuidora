// Conexão com o Neon Postgres.
// Requer a variável de ambiente DATABASE_URL configurada na Vercel
// (Project Settings → Environment Variables), com a connection string
// que o Neon te dá (algo como postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require).
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);
