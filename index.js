import express from 'express';
import fs from 'fs-extra';

const app = express();
const PORT = process.env.PORT || 8080;
const DB_FILE = './data.json';

const loadDB = async () => {
  if (!await fs.pathExists(DB_FILE)) await fs.writeJson(DB_FILE, {});
  return await fs.readJson(DB_FILE);
};

const saveDB = async (data) => {
  await fs.writeJson(DB_FILE, data, { spaces: 2 });
};

app.get('/zeroex', async (req, res) => {
  const { chat, teach, delete: del, edit, all } = req.query;
  const db = await loadDB();

  if (chat) {
    const reply = db[chat.toLowerCase()];
    return res.json({ reply: reply || "I don't know how to respond to that yet." });
  }

  if (teach) {
    const [input, output] = teach.split('|');
    if (!input || !output) return res.json({ error: 'Invalid format. Use input|output.' });

    db[input.toLowerCase()] = output;
    await saveDB(db);
    return res.json({ message: 'Taught successfully.' });
  }

  if (del) {
    const key = del.toLowerCase();
    if (!db[key]) return res.json({ error: 'Input not found.' });

    delete db[key];
    await saveDB(db);
    return res.json({ message: 'Deleted successfully.' });
  }

  if (edit) {
    const [input, newOutput] = edit.split('|');
    if (!input || !newOutput || !db[input.toLowerCase()])
      return res.json({ error: 'Invalid input or input not found.' });

    db[input.toLowerCase()] = newOutput;
    await saveDB(db);
    return res.json({ message: 'Edited successfully.' });
  }

  if (all === 'true') return res.json(db);

  res.json({ error: 'Invalid query.' });
});

app.listen(PORT, () => {
  console.log(`Zeroex Simsimi API running on port ${PORT}`);
});
