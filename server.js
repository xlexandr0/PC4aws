const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const SECRET = "super_secret_jwt_key";

// ----- DATABASE -----
const db = new sqlite3.Database("database.sqlite");
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  twofa_secret TEXT
)
`);

// ---------------------- REGISTER ----------------------
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash],
    (err) => {
      if (err) return res.status(400).json({ error: "Usuario ya existe" });
      res.json({ message: "Usuario registrado" });
    }
  );
});

// ---------------------- LOGIN (STEP 1) ----------------------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // If user doesn't have 2FA enabled → generate secret
    if (!user.twofa_secret) {
      const secret = speakeasy.generateSecret({ name: "PC4 AWS Login" });

      db.run(
        "UPDATE users SET twofa_secret = ? WHERE id = ?",
        [secret.base32, user.id]
      );

      return qrcode.toDataURL(secret.otpauth_url, (err, imageUrl) => {
        res.json({
          setup2FA: true,
          qr: imageUrl,
          base32: secret.base32
        });
      });
    }

    // If user already has 2FA, require code
    res.json({ require2FA: true });
  });
});

// ---------------------- VERIFY 2FA ----------------------
app.post("/api/verify-2fa", (req, res) => {
  const { email, token } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: "base32",
      token
    });

    if (!verified) return res.status(400).json({ error: "Código inválido" });

    const jwtToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "1h"
    });

    res.json({ success: true, token: jwtToken });
  });
});

// ---------------------- HOME ----------------------
app.get("/api/protected", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    jwt.verify(token, SECRET);
    res.json({ message: "Acceso permitido ✔" });
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

// ---------------------- START ----------------------
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
