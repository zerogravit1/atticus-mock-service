import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, 'data', 'db.json');

interface FakeDbSchema {
  users: Array<{ username: string; password: string; role: string }>;
  records: Array<{ id: string; text: string; createdBy: string }>;
}

let db: FakeDbSchema;

// Load DB from file or initialize
function load() {
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } else {
    db = {
      users: [
        { username: 'alice', password: 'password', role: 'admin' },
        { username: 'bob', password: 'password', role: 'editor' }
      ],
      records: []
    };
    save();
  }
}

// Save DB to disk
function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

load();

// API functions
export const fakeDb = {
  getUser(username: string) {
    return db.users.find(u => u.username === username);
  },

  getRecords() {
    return db.records;
  },

  addRecord(record: any) {
    db.records.push(record);
    save();
  },

  updateRecord(id: string, text: string) {
    const rec = db.records.find(r => r.id === id);
    if (rec) {
      rec.text = text;
      save();
    }
    return rec;
  },

  deleteRecord(id: string) {
    db.records = db.records.filter(r => r.id !== id);
    save();
  }
};
