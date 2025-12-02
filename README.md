
Aplicación Node.js funcional que permite:

✅ Registro de usuarios  
✅ Inicio de sesión  
✅ Autenticación en dos pasos (2FA) con Google Authenticator  
✅ Base de datos SQLite local (simple para fines académicos)  
✅ Contenerizada con Docker y Docker Compose  
✅ Desplegada en una instancia EC2 en AWS

---

# 🔧 Tecnologías utilizadas
- Node.js + Express
- SQLite3
- Bcrypt (hash de contraseñas)
- JWT (tokens de sesión)
- Speakeasy (2FA)
- Docker
- Docker Compose
- CloudFormation (para crear la EC2)

---

# 📁 Estructura del proyecto

PC4aws/
├── server.js
├── database.sqlite
├── package.json
├── Dockerfile
├── docker-compose.yml
├── public/
│ ├── login.html
│ ├── register.html
│ ├── verify-2fa.html
└── README.md

yaml
Copiar código

---

# 🚀 Cómo ejecutar la aplicación localmente (sin Docker)

## 1. Instalar dependencias
```bash
npm install
2. Ejecutar
bash
Copiar código
npm start
Abrir en navegador:

arduino
Copiar código
http://localhost:3000
🐳 Cómo ejecutar con Docker
1. Construir contenedor
bash
Copiar código
docker compose build
2. Levantar la aplicación
bash
Copiar código
docker compose up -d
3. Verificar contenedor
bash
Copiar código
docker ps
La app estará en:

arduino
Copiar código
http://localhost:3000
🔐 Flujo de autenticación
1. Registro
Se ingresa email y contraseña → se guarda con hash en SQLite.

2. Login (Paso 1)
Si credenciales son correctas:

Si el usuario NO tiene 2FA → se genera QR para configurar Google Authenticator.

Si ya tiene 2FA → se pide código del Authenticator.

3. Verificación de 2FA
Se ingresa el código dinámico y se genera un JWT.

🏗️ Despliegue en AWS
La instancia EC2 se crea automáticamente con CloudFormation:

SO: Ubuntu 20.04

Docker + Docker Compose instalados automáticamente

El repositorio se clona automáticamente

La app se levanta en el puerto 3000

1. Conectarse a la instancia
bash
Copiar código
ssh -i 2025-2.pem ubuntu@IP_PUBLICA
2. Verificar que la app está corriendo
bash
Copiar código
docker ps
3. Acceder desde el navegador
cpp
Copiar código
http://IP_PUBLICA:3000
📸 Entregables
Se deben adjuntar:

Capturas del CloudFormation funcionando

Capturas del EC2 levantado

Capturas de Docker corriendo en EC2

Capturas de la app funcionando (login, registro, QR 2FA, validación 2FA)

Enlace a este repositorio

✔ Autor
PC4 AWS – 2025

yaml
Copiar código

---

# 🟢 **README LISTO. ¿QUÉ SIGUE AHORA?**

Ahora debes completar lo siguiente **para cerrar tu práctica al 100%**:

---

# ✅ **PASO 1 — Subir todo al GitHub**
Ejecuta:

```bash
git add .
git commit -m "Aplicación completa + README"
git push origin main
✅ PASO 2 — Conectarte a EC2 y levantar la app
En tu EC2:

bash
Copiar código
cd /home/ubuntu/app
sudo docker compose down
sudo docker compose build
sudo docker compose up -d
Verifica:

bash
Copiar código
docker ps
✅ PASO 3 — Probar en el navegador
Entra a:

arduino
Copiar código
http://IP_PUBLICA:3000/register.html
http://IP_PUBLICA:3000/login.html
Regístrate → inicia sesión → escanea QR → valida 2FA → listo.
