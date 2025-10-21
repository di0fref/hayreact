const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const db = new Database("db.sqlite");
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));
function ensureColumn(table, column, type) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((c) => c.name === column);
  if (!exists) {
    console.log(`🧩 Adding missing column: ${table}.${column}`);
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
  }
}

// --- bootstrap schema ---
db.exec(`
CREATE TABLE IF NOT EXISTS deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  supplier TEXT,
  bales INTEGER,
  paid INTEGER DEFAULT 0,
  price REAL DEFAULT 0,
  kg REAL DEFAULT 0,
  invoicePath TEXT
);
CREATE TABLE IF NOT EXISTS bales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  delivery_id INTEGER,
  number INTEGER,
  isOpen INTEGER DEFAULT 0,
  isClosed INTEGER DEFAULT 0,
  bad INTEGER DEFAULT 0,
  reimbursed INTEGER DEFAULT 0,
  warm INTEGER DEFAULT 0,
  openDate TEXT,
  closeDate TEXT,
  warmDate TEXT
);
`);
ensureColumn("bales", "imagePath", "TEXT");


// --- Routes ---
app.get("/api/deliveries", (req, res) => {
  const rows = db.prepare("SELECT * FROM deliveries ORDER BY date DESC, id DESC").all();
  res.json(rows);
});

app.post("/api/deliveries", (req, res) => {
  const { date, supplier, bales } = req.body;
  const stmt = db.prepare("INSERT INTO deliveries(date, supplier, bales) VALUES (?, ?, ?)");
  const result = stmt.run(date, supplier, bales);
  const id = result.lastInsertRowid;
  const insBale = db.prepare("INSERT INTO bales(delivery_id, number) VALUES (?, ?)");
  for (let i = 1; i <= bales; i++) insBale.run(id, i);
  res.json({ id });
});

app.put("/api/deliveries/:id", (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.sendStatus(400);
  const set = keys.map((k) => `${k}=@${k}`).join(", ");
  db.prepare(`UPDATE deliveries SET ${set} WHERE id=@id`).run({ id: req.params.id, ...fields });
  res.sendStatus(200);
});

app.get("/api/bales/:deliveryId", (req, res) => {
  const rows = db.prepare("SELECT * FROM bales WHERE delivery_id=? ORDER BY number").all(req.params.deliveryId);
  res.json(rows);
});

app.put("/api/bales/:id", (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.sendStatus(400);
  const set = keys.map((k) => `${k}=@${k}`).join(", ");
  db.prepare(`UPDATE bales SET ${set} WHERE id=@id`).run({ id: req.params.id, ...fields });
  res.sendStatus(200);
});

// --- Invoice upload ---
app.post("/api/invoice/:deliveryId", upload.single("file"), (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  db.prepare("UPDATE deliveries SET invoicePath=? WHERE id=?").run(filePath, req.params.deliveryId);
  res.json({ path: filePath });
});

app.delete("/api/invoice/:deliveryId", (req, res) => {
  const row = db.prepare("SELECT invoicePath FROM deliveries WHERE id=?").get(req.params.deliveryId);
  if (row?.invoicePath) {
    try { fs.unlinkSync(path.join(__dirname, row.invoicePath)); } catch {}
  }
  db.prepare("UPDATE deliveries SET invoicePath=NULL WHERE id=?").run(req.params.deliveryId);
  res.sendStatus(200);
});

// --- Bale image upload ---
app.post("/api/bale-image/:baleId", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const filePath = `/uploads/${req.file.filename}`;
    db.prepare("UPDATE bales SET imagePath=? WHERE id=?").run(filePath, req.params.baleId);
    res.json({ path: filePath });
});

app.delete("/api/bale-image/:baleId", (req, res) => {
    const row = db.prepare("SELECT imagePath FROM bales WHERE id=?").get(req.params.baleId);
    if (row?.imagePath) {
        try { fs.unlinkSync(path.join(__dirname, row.imagePath)); } catch {}
    }
    db.prepare("UPDATE bales SET imagePath=NULL WHERE id=?").run(req.params.baleId);
    res.sendStatus(200);
});

app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
