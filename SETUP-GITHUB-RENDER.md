# 🚀 GUIDA SETUP GITHUB + RENDER.COM

## STEP 1: Crea Account GitHub ✅

1. Vai su https://github.com/signup
2. Inserisci email
3. Scegli password
4. Scegli username (es: zenovashop)
5. Completa verifica
6. Conferma email

---

## STEP 2: Crea Repository GitHub

Dopo aver creato l'account:

1. Click sul + in alto a destra → "New repository"
2. Nome repository: `zenova-ecommerce`
3. Descrizione: "E-commerce Zenova - Natural Wellness"
4. Privacy: **Private** (consigliato) o Public
5. NON aggiungere README, .gitignore, license
6. Click "Create repository"

7. **COPIA l'URL** che appare (es: `https://github.com/tuousername/zenova-ecommerce.git`)

---

## STEP 3: Collega repository locale a GitHub

Io eseguirò questi comandi per te:

```bash
git remote add origin https://github.com/TUO_USERNAME/zenova-ecommerce.git
git branch -M main
git push -u origin main
```

**Dovrai inserire:**
- Username GitHub
- Password: usa un **Personal Access Token** (ti spiego dopo)

---

## STEP 4: Crea Personal Access Token

GitHub richiede un token invece della password:

1. GitHub → Click tua foto profilo (alto destra)
2. Settings
3. Developer settings (in fondo a sinistra)
4. Personal access tokens → Tokens (classic)
5. Generate new token → Generate new token (classic)
6. Note: "Zenova Deploy"
7. Expiration: 90 days
8. Seleziona scope: **repo** (tutto)
9. Click "Generate token"
10. **COPIA IL TOKEN** (lo vedi una volta sola!)

---

## STEP 5: Push codice

Quando hai il token, io eseguirò:
```bash
git push -u origin main
```

Ti chiederà:
- Username: [tuo username GitHub]
- Password: [incolla il token]

---

## STEP 6: Crea account Render.com

1. Vai su https://render.com
2. Click "Get Started for Free"
3. Scegli "Sign up with GitHub"
4. Autorizza Render ad accedere a GitHub
5. Login completato!

---

## STEP 7: Deploy Backend su Render

1. Dashboard Render → "New +" → "Web Service"
2. Click "Connect" accanto a `zenova-ecommerce`
3. Configurazione:
   - Name: `zenova-backend`
   - Region: Frankfurt (più vicino)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: **Free**
4. Click "Create Web Service"

---

## STEP 8: Crea Database PostgreSQL

1. Dashboard Render → "New +" → "PostgreSQL"
2. Name: `zenova-db`
3. Database: `zenova`
4. User: `zenova`
5. Region: Frankfurt
6. Instance Type: **Free**
7. Click "Create Database"
8. **COPIA "Internal Database URL"** dalla pagina del database

---

## STEP 9: Configura Environment Variables

Nel Web Service `zenova-backend`:

1. Tab "Environment"
2. Click "Add Environment Variable"
3. Aggiungi tutte le variabili (lista sotto)
4. Click "Save Changes"

### Variabili da aggiungere:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=[URL del database copiato prima]
BIGBUY_API_URL=https://api.bigbuy.eu
BIGBUY_API_KEY=NmU4OGIwNzk4N2NhNDY4ODQ0ZTU5ZDYwYWZmNTVhNjkyMWIyNTI2YWE3MGE4YzFiMzZhMjVhYWE1NmMzNmU3Mg
BIGBUY_FTP_HOST=www.dropshippers.com.es
BIGBUY_FTP_USER=bbCDCSK9mS6i
BIGBUY_FTP_PASSWORD=XgVEDUdao7
AW_API_URL=https://app.aiku.io/app/re-api
AW_API_TOKEN=248|HGq3pkeK2zwML3mLFI8Q3J6avhPHIhH0vKfEuMnPdde988fa
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=AaUVAYba3rAHoZowsnhPirSm-vnNNnGL_bSZn7iGiLrtZwkyqRAAfFlwMZLIieRGksTz1TLVo83tNejt
PAYPAL_CLIENT_SECRET=EDXoGn-H8UDBXXf5VUMVre2xGdoY1k3ekzn4hv3zVdCRldjG-WsQgLtdZejvhXfyNdbKp2fTb2_lZQp6
FRONTEND_URL=https://shop.zenova.ovh
JWT_SECRET=zenova_production_jwt_2025_change_this
SESSION_SECRET=zenova_production_session_2025_change_this
LOG_LEVEL=info
```

---

## STEP 10: Deploy completato!

Render farà il deploy automaticamente.

Attendi 3-5 minuti, poi:
1. Copia l'URL del backend (es: https://zenova-backend.onrender.com)
2. Usalo per aggiornare config.js

---

**Ora sei pronto! Segui questi step nell'ordine.** 🚀
