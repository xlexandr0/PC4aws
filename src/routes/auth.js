// src/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");

const { generateSecret, generateQR, verifyToken } = require("../lib/twofa");
const router = express.Router();


// -----------------------
// REGISTRO
// -----------------------
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
      [email, hash]
    );
    res.json({ message: "Usuario registrado" });
  } catch (err) {
    res.status(400).json({ error: "Usuario ya existe" });
  }
});

// -----------------------
// LOGIN (PRIMERA ETAPA)
// -----------------------
router.post("/login", async (req, res) => {
  const { email, password, token } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);

  if (user.rowCount === 0)
    return res.status(400).json({ error: "Credenciales inválidas" });

  const u = user.rows[0];

  const validPassword = await bcrypt.compare(password, u.password_hash);

  if (!validPassword)
    return res.status(400).json({ error: "Credenciales inválidas" });

  if (u.twofa_enabled === true) {
    if (!token)
      return res.json({ need2fa: true, message: "Ingrese código 2FA" });

    const validToken = verifyToken(u.twofa_secret, token);

    if (!validToken)
      return res.status(400).json({ error: "Código 2FA incorrecto" });
  }

  const jwtToken = jwt.sign(
    { id: u.id, email: u.email },
    "secreto-ultra-seguro"
  );

  res.json({ message: "Login exitoso", token: jwtToken });
});

// -----------------------
// CONFIGURAR 2FA
// -----------------------
router.post("/2fa/setup", async (req, res) => {
  const { email } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (user.rowCount === 0)
    return res.status(400).json({ error: "Usuario no existe" });

  const secret = generateSecret(email);

  await pool.query(
    "UPDATE users SET twofa_secret=$1 WHERE email=$2",
    [secret.base32, email]
  );

  const qrImage = await generateQR(secret.otpauth_url);

  res.json({
    message: "Escanee este QR en Google Authenticator",
    qr: qrImage,
    secret: secret.base32,
  });
});

// -----------------------
// CONFIRMAR ACTIVACIÓN 2FA
// -----------------------
router.post("/2fa/confirm", async (req, res) => {
  const { email, token } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (user.rowCount === 0)
    return res.status(400).json({ error: "Usuario no existe" });

  const u = user.rows[0];

  const ok = verifyToken(u.twofa_secret, token);

  if (!ok) return res.status(400).json({ error: "Token inválido" });

  await pool.query(
    "UPDATE users SET twofa_enabled=true WHERE id=$1",
    [u.id]
  );

  res.json({ message: "2FA habilitado correctamente" });
});

module.exports = router;
