const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// database
const db = new sqlite3.Database("database.db");

// tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      text TEXT,
      date TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      title TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    )
  `);
});

// -------- NEWS API (خیلی مهم: بدون language=fa) --------
app.get("/api/news", async (req, res) => {
  try {
    const query = req.query.q || "artificial intelligence";
    const apiKey = "API_KEY_خودت";

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&sortBy=publishedAt&apiKey=${apiKey}`
    );

    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: "خطا در دریافت اخبار" });
  }
});

// -------- COMMENTS --------
app.post("/comments", (req, res) => {
  const { name, text } = req.body;
  const date = new Date().toLocaleString("fa-IR");

  db.run(
    `INSERT INTO comments (name, text, date) VALUES (?, ?, ?)`,
    [name, text, date],
    () => res.json({ message: "نظر ثبت شد" })
  );
});

app.get("/comments", (req, res) => {
  db.all(`SELECT * FROM comments ORDER BY id DESC`, [], (err, rows) => {
    res.json(rows);
  });
});

// -------- LIKES --------
app.post("/like", (req, res) => {
  const { title } = req.body;

  db.run(
    `INSERT INTO likes (title, count)
     VALUES (?, 1)
     ON CONFLICT(title) DO UPDATE SET count = count + 1`,
    [title],
    () => res.json({ message: "لایک شد" })
  );
});

app.get("/likes", (req, res) => {
  db.all(`SELECT * FROM likes`, [], (err, rows) => {
    res.json(rows);
  });
});

// main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
