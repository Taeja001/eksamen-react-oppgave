const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("child_process");
 
const app = express();
const PORT = 5000;
 
app.use(cors());
app.use(express.json());
 
// SQLite tilkobling og initiering
const db = new sqlite3.Database("./support.db", (err) => {
  if (err) {
    console.error("Kunne ikke koble til SQLite:", err);
  } else {
    console.log("Tilkoblet SQLite-database");
  }
});
 
// Opprett tabell hvis den ikke finnes
db.run(`
  CREATE TABLE IF NOT EXISTS support_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    problem_type TEXT NOT NULL,
    description TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
 
// POST: legg inn support-henvendelse
app.post("/api/support", (req, res) => {
  const { name, email, problem_type, description } = req.body;
 
  const stmt = `INSERT INTO support_requests (name, email, problem_type, description) VALUES (?, ?, ?, ?)`;
  db.run(stmt, [name, email, problem_type, description], function (err) {
    if (err) {
      console.error("Feil ved innsending:", err);
      return res.status(500).json({ error: "Database insert error" });
    }
    res.status(201).json({ message: "Henvendelse sendt", id: this.lastID });
  });
});
 
// GET: hent alle support-henvendelser (med enkel auth)
app.get("/api/support", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).send("Authentication required.");
  }
 
  const base64 = auth.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64").toString().split(":");
 
  if (user !== "admin" || pass !== "admin123") {
    return res.status(403).send("Forbidden");
  }
 
  db.all(`SELECT * FROM support_requests ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      console.error("Feil ved henting:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(rows);
  });
});
 
// PUT: oppdater status for support-henvendelse
app.put("/api/support/:id/resolve", (req, res) => {
  const id = req.params.id;
  const { resolved } = req.body;
 
  const stmt = `UPDATE support_requests SET is_resolved = ? WHERE id = ?`;
  db.run(stmt, [resolved ? 1 : 0, id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Database update error" });
    }
    res.json({ message: "Status oppdatert" });
  });
});
 
// POST: AD-brukeropprettelse via Python-script
app.post("/api/support/:id/ad", (req, res) => {
  const { username, name, type } = req.body;
  const password = "Temp123!";
 
  console.log(`Oppretter AD-bruker for ${name} (${type})`);
 
  const cmd = `python3 create_ad_user.py --username ${username} --password ${password}`;
 
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Feil i AD-skript:", err);
      return res.status(500).json({
        error: "Feil under AD-opprettelse",
        stderr: stderr.toString(),
      });
    }
 
    console.log("AD-bruker opprettet:", stdout);
    res.json({ message: "Bruker opprettet i AD", output: stdout });
  });
});
 
// Start server
app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});
 