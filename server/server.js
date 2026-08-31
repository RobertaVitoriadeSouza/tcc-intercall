const path = require('node:path');
const express = require('express');
const { pool, ensureSchema } = require('./db');
const { createPasswordRecord, verifyPassword, createSessionToken, sessionExpiry } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, '..');

app.use(express.json());

// Nunca expor a pasta do servidor (contém dados sensíveis)
app.use('/server', (req, res) => res.status(404).end());

// Em produção na Vercel os arquivos estáticos são servidos direto pela CDN;
// isso aqui só é usado quando rodamos localmente com "node server/server.js".
app.use(express.static(SITE_DIR));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getUserBySession(token) {
  if (!token) return null;
  const { rows } = await pool.query(
    'SELECT user_id, expires_at FROM sessions WHERE token = $1',
    [token]
  );
  const session = rows[0];
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    return null;
  }
  const userResult = await pool.query(
    'SELECT id, nome, email FROM users WHERE id = $1',
    [session.user_id]
  );
  return userResult.rows[0] || null;
}

function getToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
}

// ---------- Cadastro ----------
app.post('/api/register', async (req, res) => {
  try {
    await ensureSchema();
    const { email, senha, confirmarSenha } = req.body || {};
    // O formulário de cadastro do Figma só tem Email, Senha e Confirmar Senha
    // (sem campo de Nome), então usamos a parte antes do @ como nome de exibição.
    const nome = (req.body && req.body.nome) || (email ? email.split('@')[0] : '');

    if (!email || !senha || !confirmarSenha) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
    }
    if (senha !== confirmarSenha) {
      return res.status(400).json({ error: 'As senhas não coincidem.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ error: 'Já existe uma conta com esse email.' });
    }

    const { salt, hash } = createPasswordRecord(senha);
    const inserted = await pool.query(
      'INSERT INTO users (nome, email, salt, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
      [nome, email.toLowerCase(), salt, hash]
    );
    const userId = inserted.rows[0].id;

    const token = createSessionToken();
    await pool.query(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, userId, sessionExpiry()]
    );

    res.status(201).json({ token, nome, email: email.toLowerCase() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ---------- Login ----------
app.post('/api/login', async (req, res) => {
  try {
    await ensureSchema();
    const { email, senha } = req.body || {};

    if (!email || !senha) {
      return res.status(400).json({ error: 'Preencha email e senha.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !verifyPassword(senha, user.salt, user.password_hash)) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const token = createSessionToken();
    await pool.query(
      'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
      [token, user.id, sessionExpiry()]
    );

    res.json({ token, nome: user.nome, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ---------- Usuário logado ----------
app.get('/api/me', async (req, res) => {
  try {
    await ensureSchema();
    const user = await getUserBySession(getToken(req));
    if (!user) return res.status(401).json({ error: 'Não autenticado.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ---------- Logout ----------
app.post('/api/logout', async (req, res) => {
  try {
    await ensureSchema();
    const token = getToken(req);
    if (token) await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Na Vercel a função é invocada por requisição, sem app.listen.
// Localmente ("node server/server.js") continua funcionando como antes.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`IntelliCart rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
