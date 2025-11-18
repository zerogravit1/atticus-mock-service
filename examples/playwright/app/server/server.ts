import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fakeDb } from './fakeDb';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Auth ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = fakeDb.getUser(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid login' });
  }

  // Return a simple session object
  res.json({
    username: user.username,
    role: user.role,
    token: Buffer.from(username).toString('base64')
  });
});

// --- Records ---
app.get('/records', (req, res) => {
  res.json(fakeDb.getRecords());
});

app.post('/records', (req, res) => {
  const { text, createdBy } = req.body;

  const record = {
    id: uuid(),
    text,
    createdBy
  };

  fakeDb.addRecord(record);

  res.json(record);
});

app.put('/records/:id', (req, res) => {
  const { text } = req.body;
  const updated = fakeDb.updateRecord(req.params.id, text);

  if (!updated) return res.status(404).json({ error: 'Record not found' });

  res.json(updated);
});

app.delete('/records/:id', (req, res) => {
  fakeDb.deleteRecord(req.params.id);
  res.json({ ok: true });
});

// --- Serve frontend ---
app.use(express.static('src/frontend'));

app.listen(3001, () => {
  console.log('\n🚀 Fake App Running at http://localhost:3001\n');
});
