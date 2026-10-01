const express = require('express');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // change this!

const db = new Database(path.join(__dirname, 'data.db'));
db.exec(`
CREATE TABLE IF NOT EXISTS lessons(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, cat TEXT DEFAULT 'basics', body TEXT NOT NULL, code TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS questions(id INTEGER PRIMARY KEY AUTOINCREMENT, q TEXT NOT NULL, opts TEXT NOT NULL, answer INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS scores(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, score INTEGER NOT NULL, total INTEGER NOT NULL, at TEXT NOT NULL);
`);

// Sample data on first run
const seed = require('./seed.json');
if (!db.prepare('SELECT COUNT(*) c FROM lessons').get().c) {
  const st = db.prepare('INSERT INTO lessons(title,cat,body,code) VALUES(?,?,?,?)');
  seed.lessons.forEach(l => st.run(l.title, l.cat, l.body, l.code));
}
if (!db.prepare('SELECT COUNT(*) c FROM questions').get().c) {
  const st = db.prepare('INSERT INTO questions(q,opts,answer) VALUES(?,?,?)');
  seed.questions.forEach(q => st.run(q.q, JSON.stringify(q.opts), q.a));
}

const lesson = r => ({ id: String(r.id), title: r.title, cat: r.cat, body: r.body, code: r.code });
const question = r => ({ id: String(r.id), q: r.q, opts: JSON.parse(r.opts), a: r.answer });
const score = r => ({ id: String(r.id), name: r.name, score: r.score, total: r.total, at: r.at });

const tokens = new Set();
const auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (!tokens.has(t)) return res.status(401).json({ error: 'Unauthorized: please log in' });
  next();
};
const bad = (res, msg) => res.status(400).json({ error: msg });
const str = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.length <= max;

const app = express();
app.use(express.json({ limit: '100kb' }));

app.post('/api/login', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  const t = crypto.randomBytes(24).toString('hex');
  tokens.add(t);
  res.json({ token: t });
});

// ---- Lessons ----
const checkLesson = b => (str(b.title, 3, 120) && str(b.body, 5, 2000) && typeof (b.code ?? '') === 'string' && (b.code ?? '').length <= 4000) ? null : 'Invalid lesson data';
app.get('/api/lessons', (_, res) => res.json(db.prepare('SELECT * FROM lessons ORDER BY id').all().map(lesson)));
app.post('/api/lessons', auth, (req, res) => {
  const e = checkLesson(req.body); if (e) return bad(res, e);
  const { title, cat, body, code } = req.body;
  const r = db.prepare('INSERT INTO lessons(title,cat,body,code) VALUES(?,?,?,?)').run(title.trim(), cat || 'basics', body.trim(), code || '');
  res.status(201).json(lesson(db.prepare('SELECT * FROM lessons WHERE id=?').get(r.lastInsertRowid)));
});
app.put('/api/lessons/:id', auth, (req, res) => {
  const e = checkLesson(req.body); if (e) return bad(res, e);
  const { title, cat, body, code } = req.body;
  const r = db.prepare('UPDATE lessons SET title=?,cat=?,body=?,code=? WHERE id=?').run(title.trim(), cat || 'basics', body.trim(), code || '', req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json(lesson(db.prepare('SELECT * FROM lessons WHERE id=?').get(req.params.id)));
});
app.delete('/api/lessons/:id', auth, (req, res) => {
  db.prepare('DELETE FROM lessons WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---- Quiz questions (with answers) ----
const checkQ = b => (str(b.q, 3, 300) && Array.isArray(b.opts) && b.opts.length === 4 && b.opts.every(o => str(o, 1, 200)) && Number.isInteger(b.a) && b.a >= 0 && b.a <= 3) ? null : 'Invalid question data';
app.get('/api/questions', (_, res) => res.json(db.prepare('SELECT * FROM questions ORDER BY id').all().map(question)));
app.post('/api/questions', auth, (req, res) => {
  const e = checkQ(req.body); if (e) return bad(res, e);
  const r = db.prepare('INSERT INTO questions(q,opts,answer) VALUES(?,?,?)').run(req.body.q.trim(), JSON.stringify(req.body.opts), req.body.a);
  res.status(201).json(question(db.prepare('SELECT * FROM questions WHERE id=?').get(r.lastInsertRowid)));
});
app.put('/api/questions/:id', auth, (req, res) => {
  const e = checkQ(req.body); if (e) return bad(res, e);
  const r = db.prepare('UPDATE questions SET q=?,opts=?,answer=? WHERE id=?').run(req.body.q.trim(), JSON.stringify(req.body.opts), req.body.a, req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Not found' });
  res.json(question(db.prepare('SELECT * FROM questions WHERE id=?').get(req.params.id)));
});
app.delete('/api/questions/:id', auth, (req, res) => {
  db.prepare('DELETE FROM questions WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ---- Scores (students submit, admin views) ----
app.get('/api/scores', auth, (_, res) => res.json(db.prepare('SELECT * FROM scores ORDER BY id DESC').all().map(score)));
app.post('/api/scores', (req, res) => {
  const { name, score: s, total } = req.body;
  if (!str(name, 2, 30) || !Number.isInteger(s) || !Number.isInteger(total) || s < 0 || s > total || total > 100) return bad(res, 'Invalid score data');
  const at = new Date().toISOString().slice(0, 10);
  const r = db.prepare('INSERT INTO scores(name,score,total,at) VALUES(?,?,?,?)').run(name.trim(), s, total, at);
  res.status(201).json(score(db.prepare('SELECT * FROM scores WHERE id=?').get(r.lastInsertRowid)));
});

// ---- Frontend ----
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.listen(PORT, () => console.log(`CSS Knowledge Hub running at http://localhost:${PORT}`));
