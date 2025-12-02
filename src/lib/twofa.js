const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

function generateSecret(email) {
  const secret = speakeasy.generateSecret({
    name: `MiAplicacion(${email})`,
    length: 20,
  });
  return secret;
}

async function generateQR(otpauth_url) {
  return await qrcode.toDataURL(otpauth_url);
}

function verifyToken(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

module.exports = { generateSecret, generateQR, verifyToken };
