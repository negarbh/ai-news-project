const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ اتصال به دیتابیس
const db = new sqlite3.Database("database.db", (err) => {
  if (err) console.error("❌ Database error:", err);
  else console.log("✅ Connected to SQLite database");
});

// ✅ ساخت جدول‌ها
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT UNIQUE,
      count INTEGER DEFAULT 0
    )
  `);
});

// 📩 ذخیره نظر
app.post("/comments", (req, res) => {
  const { name, text } = req.body;
  const date = new Date().toLocaleString("fa-IR");
  if (!name || !text)
    return res.status(400).json({ error: "لطفاً نام و نظر را وارد کنید" });

  db.run(
    `INSERT INTO comments (name, text, date) VALUES (?, ?, ?)`,
    [name, text, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "✅ نظر ثبت شد", id: this.lastID });
    }
  );
});

// 📜 دریافت نظرات
app.get("/comments", (req, res) => {
  db.all(`SELECT * FROM comments ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 👍 افزودن لایک
app.post("/like", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "عنوان لازم است" });

  db.run(
    `INSERT INTO likes (title, count) VALUES (?, 1)
     ON CONFLICT(title) DO UPDATE SET count = count + 1`,
    [title],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "✅ Like added" });
    }
  );
});

// 📊 دریافت تعداد لایک‌ها
app.get("/likes", (req, res) => {
  db.all(`SELECT * FROM likes`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🌐 مسیر دریافت اخبار
app.get("/api/news", async (req, res) => {
  try {
    const query = req.query.q || "هوش مصنوعی";
    const apiKey = "f62ecc7d91f543f59e791d8a38922016"; // کلید NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=fa&sortBy=publishedAt&apiKey=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "خطا در دریافت اخبار" });
  }
});

// 🏠 ارسال فایل اصلی سایت
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 اجرای سرور
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
