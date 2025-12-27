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
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      url TEXT,
      image TEXT,
      description TEXT
    )
  `);
});

// add favorite
app.post("/favorites", (req, res) => {
  const { title, url, image, description } = req.body;
  db.run(
    `INSERT INTO favorites (title, url, image, description) VALUES (?, ?, ?, ?)`,
    [title, url, image, description],
    () => res.json({ message: "saved" })
  );
});

// get favorites
app.get("/favorites", (req, res) => {
  db.all(`SELECT * FROM favorites ORDER BY id DESC`, [], (err, rows) => {
    res.json(rows);
  });
});

// news api
app.get("/api/news", async (req, res) => {
  const q = req.query.q || "هوش مصنوعی";
  const apiKey = "f62ecc7d91f543f59e791d8a38922016";
  const r = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&apiKey=${apiKey}`
  );
  const data = await r.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
