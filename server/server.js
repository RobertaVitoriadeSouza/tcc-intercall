const path = require('node:path');
const express = require('express');
const db = require('./db');
const { createPasswordRecord, verifyPassword, createSessionToken, sessionExpiry } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, '..');

app.use(express.json());

// Nunca expor a pasta do servidor (contém o banco de dados com senhas)
app.use('/server', (req, res) => res.status(404).end());

app.use(express.static(SITE_DIR));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getUserBySession(token) {
  if (!token) return null;
  const session = db.prepare(
    'SELECT user_id, expires_at FROM sessions WHERE token = ?'
  ).get(token);
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }
  return db.prepare('SELECT id, nome, email FROM users WHERE id = ?').get(session.user_id);
}

function getToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' ? token : null;
}

// ---------- Cadastro ----------
app.post('/api/register', (req, res) => {
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

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta com esse email.' });
  }

  const { salt, hash } = createPasswordRecord(senha);
  const info = db.prepare(
    'INSERT INTO users (nome, email, salt, password_hash) VALUES (?, ?, ?, ?)'
  ).run(nome, email.toLowerCase(), salt, hash);

  const token = createSessionToken();
  db.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(token, info.lastInsertRowid, sessionExpiry());

  res.status(201).json({ token, nome, email: email.toLowerCase() });
});

// ---------- Login ----------
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json({ error: 'Preencha email e senha.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !verifyPassword(senha, user.salt, user.password_hash)) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  const token = createSessionToken();
  db.prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(token, user.id, sessionExpiry());

  res.json({ token, nome: user.nome, email: user.email });
});

// ---------- Usuário logado ----------
app.get('/api/me', (req, res) => {
  const user = getUserBySession(getToken(req));
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });
  res.json(user);
});

// ---------- Logout ----------
app.post('/api/logout', (req, res) => {
  const token = getToken(req);
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`IntelliCart rodando em http://localhost:${PORT}`);
});
