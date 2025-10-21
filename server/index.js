const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const db = new Database("db.sqlite");
const uploadDir = path.join(__dirname, "uploads");
const jwt = require("jsonwebtoken");
const SECRET = "supersecretkey"; // Replace with env var in production

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({storage});

app.use(cors());
app.use(express.json());
function auth(requiredRole) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).send("Missing token");
        const token = authHeader.split(" ")[1];
        try {
            const user = jwt.verify(token, SECRET);
            if (requiredRole && user.role !== requiredRole) {
                return res.status(403).send("Forbidden");
            }
            req.user = user;
            next();
        } catch {
            res.status(401).send("Invalid or expired token");
        }
    };
}

function ensureColumn(table, column, type) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = columns.some((c) => c.name === column);
    if (!exists) {
        console.log(`🧩 Adding missing column: ${table}.${column}`);
        db.prepare(`ALTER TABLE ${table}
            ADD COLUMN ${column} ${type}`).run();
    }
}
app.use("/uploads", express.static(uploadDir));

// --- bootstrap schema ---
db.exec(`
    CREATE TABLE IF NOT EXISTS deliveries
    (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        date        TEXT,
        supplier    TEXT,
        bales       INTEGER,
        paid        INTEGER DEFAULT 0,
        price       REAL    DEFAULT 0,
        kg          REAL    DEFAULT 0,
        invoicePath TEXT
    );
    CREATE TABLE IF NOT EXISTS bales
    (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER,
        number      INTEGER,
        isOpen      INTEGER DEFAULT 0,
        isClosed    INTEGER DEFAULT 0,
        bad         INTEGER DEFAULT 0,
        reimbursed  INTEGER DEFAULT 0,
        warm        INTEGER DEFAULT 0,
        openDate    TEXT,
        closeDate   TEXT,
        warmDate    TEXT
    );
`);
db.exec(`
    CREATE TABLE IF NOT EXISTS users
    (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role     TEXT
    );
`);

ensureColumn("bales", "imagePath", "TEXT");
ensureColumn("users", "username", "TEXT");
ensureColumn("users", "password", "TEXT");
ensureColumn("users", "role", "TEXT"); // "admin" or "user"
ensureColumn("users", "email", "TEXT");

const admin = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!admin) {
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin123", "admin");
    console.log("✅ Default admin user created: admin / admin123");
}


app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = db
        .prepare("SELECT * FROM users WHERE username=?")
        .get(username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET,
        { expiresIn: "8h" }
    );
    res.json({ token });
});




// --- Routes ---

app.get("/api/users", auth("admin"), (req, res) => {
    res.json(db.prepare("SELECT id, username, email, role FROM users").all());
});

app.post("/api/users", auth("admin"), async (req, res) => {
    const { username, password, role, email } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    db.prepare(
        "INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)"
    ).run(username, hashed, role, email);
    res.sendStatus(200);
});

app.put("/api/users/:id", auth("admin"), (req, res) => {
    const { username, email, role } = req.body;
    db.prepare("UPDATE users SET username=?, email=?, role=? WHERE id=?").run(
        username,
        email,
        role,
        req.params.id
    );
    res.sendStatus(200);
});


app.delete("/api/users/:id", auth("admin"), (req, res) => {
    db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
    res.sendStatus(200);
});

app.get("/api/deliveries", (req, res) => {
    const rows = db.prepare("SELECT * FROM deliveries ORDER BY date DESC, id DESC").all();
    res.json(rows);
});

app.post("/api/deliveries", (req, res) => {
    const {date, supplier, bales} = req.body;
    const stmt = db.prepare("INSERT INTO deliveries(date, supplier, bales) VALUES (?, ?, ?)");
    const result = stmt.run(date, supplier, bales);
    const id = result.lastInsertRowid;
    const insBale = db.prepare("INSERT INTO bales(delivery_id, number) VALUES (?, ?)");
    for (let i = 1; i <= bales; i++) insBale.run(id, i);
    res.json({id});
});

app.put("/api/deliveries/:id", (req, res) => {
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.sendStatus(400);
    const set = keys.map((k) => `${k}=@${k}`).join(", ");
    db.prepare(`UPDATE deliveries
                SET ${set}
                WHERE id = @id`).run({id: req.params.id, ...fields});
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

    db.prepare(`UPDATE bales
                SET ${set}
                WHERE id = @id`).run({id: req.params.id, ...fields});

    const return_data = {
        id: req.params.id,
        set: set,
        fields: fields,
    }
    res.json(return_data);
});

// --- Invoice upload ---
app.post("/api/invoice/:deliveryId", upload.single("file"), (req, res) => {
    const filePath = `/uploads/${req.file.filename}`;
    db.prepare("UPDATE deliveries SET invoicePath=? WHERE id=?").run(filePath, req.params.deliveryId);
    res.json({path: filePath});
});

app.delete("/api/invoice/:deliveryId", (req, res) => {
    const row = db.prepare("SELECT invoicePath FROM deliveries WHERE id=?").get(req.params.deliveryId);
    if (row?.invoicePath) {
        try {
            fs.unlinkSync(path.join(__dirname, row.invoicePath));
        } catch {
        }
    }
    db.prepare("UPDATE deliveries SET invoicePath=NULL WHERE id=?").run(req.params.deliveryId);
    res.sendStatus(200);
});

// --- Bale image upload ---
app.post("/api/bale-image/:baleId", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    const filePath = `/uploads/${req.file.filename}`;
    db.prepare("UPDATE bales SET imagePath=? WHERE id=?").run(filePath, req.params.baleId);
    res.json({path: filePath});
});

app.delete("/api/bale-image/:baleId", (req, res) => {
    const row = db.prepare("SELECT imagePath FROM bales WHERE id=?").get(req.params.baleId);
    if (row?.imagePath) {
        try {
            fs.unlinkSync(path.join(__dirname, row.imagePath));
        } catch {
        }
    }
    db.prepare("UPDATE bales SET imagePath=NULL WHERE id=?").run(req.params.baleId);
    res.sendStatus(200);
});


app.get("/api/report", (req, res) => {
    // --- AVG open time (days) for closed bales ---
    const avgRow = db.prepare(`
    SELECT ROUND(AVG(julianday(closeDate) - julianday(openDate)), 1) AS avgDays
    FROM bales
    WHERE openDate IS NOT NULL AND closeDate IS NOT NULL
  `).get();
    const avgOpenTime = avgRow?.avgDays || 0;

    // --- Opened last 30 days ---
    const opened30Row = db.prepare(`
    SELECT COUNT(*) AS cnt
    FROM bales
    WHERE openDate IS NOT NULL
      AND julianday(openDate) >= julianday('now','-30 day')
  `).get();
    const opened30 = opened30Row.cnt;
    const ratePerDay = Number((opened30 / 30).toFixed(2));

    // --- Stock left: NOT opened AND NOT closed ---
    const stockLeftRow = db.prepare(`
    SELECT COUNT(*) AS cnt
    FROM bales
    WHERE openDate IS NULL AND closeDate IS NULL
  `).get();
    const stockLeft = stockLeftRow.cnt;

    // --- Forecast ---
    const daysLeft = ratePerDay > 0 ? Math.round(stockLeft / ratePerDay) : 0;
    const predictedEndISO = db.prepare(`SELECT date('now', ? ) AS d`).get(`+${daysLeft} day`).d;

    // --- Bad & NOT reimbursed (corrected) ---
    const badUnreimbursed = db.prepare(`
    SELECT b.id, b.number, b.openDate, d.supplier, d.date AS deliveryDate
    FROM bales b
    JOIN deliveries d ON d.id = b.delivery_id
    WHERE b.bad = 1 AND (b.reimbursed = 0 OR b.reimbursed IS NULL)
    ORDER BY d.date DESC, b.number ASC
  `).all();

    res.json({
        avgOpenTime,
        opened30,
        ratePerDay,
        stockLeft,
        daysLeft,
        predictedEnd: predictedEndISO, // yyyy-mm-dd
        badUnreimbursed,               // [{id, number, supplier, deliveryDate, openDate}]
    });
});



app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
