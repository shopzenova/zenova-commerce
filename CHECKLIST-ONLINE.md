# ✅ CHECKLIST PER ANDARE ONLINE
## Zenova E-commerce - 14 Dicembre 2025

---

## 📊 STATO ATTUALE

### ✅ Già Funzionante
- ✅ Backend Node.js completo e testato
- ✅ BigBuy API attiva (modalità REAL)
- ✅ AW Dropship API attiva (modalità REAL)
- ✅ 4367 prodotti caricati e categorizzati
- ✅ Frontend completo con tutte le pagine
- ✅ Carrello funzionante
- ✅ Sistema di ricerca
- ✅ Pannello admin

### ⚠️ In Modalità Test
- ⚠️ PayPal in SANDBOX (test mode)
- ⚠️ Stripe NON configurato
- ⚠️ Email NON configurate
- ⚠️ Database SQLite locale

---

## 🎯 COSA MANCA PER ANDARE ONLINE

### 1️⃣ HOSTING E DEPLOY (OBBLIGATORIO)

#### Opzione A: Railway (Consigliato - Più Semplice)
**Costo**: ~$5-10/mese
**Pro**: Deploy automatico, facile, supporta Node.js + database
**Contro**: Costo mensile

**Passi**:
1. Crea account su https://railway.app
2. Collega repository GitHub
3. Deploy automatico del backend
4. Frontend su Vercel o Netlify (gratis)

#### Opzione B: Vercel (Solo Frontend) + Railway (Backend)
**Costo**: Gratis frontend + $5-10/mese backend
**Pro**: Frontend gratis e veloce
**Contro**: Due piattaforme separate

#### Opzione C: VPS (DigitalOcean, Hetzner)
**Costo**: ~$5-20/mese
**Pro**: Controllo totale
**Contro**: Devi gestire server, aggiornamenti, sicurezza

**Raccomandazione**: Railway per backend + Vercel per frontend

---

### 2️⃣ PAYPAL PRODUCTION (OBBLIGATORIO)

**Stato attuale**: Sandbox (test mode)
**Cosa serve**:

1. **Account PayPal Business** (già ce l'hai?)
   - Se NO: Vai su https://www.paypal.com/it/business
   - Crea account Business (gratuito)
   - Verifica identità e dati aziendali

2. **Ottieni credenziali LIVE**
   - Vai su https://developer.paypal.com
   - Sezione "Apps & Credentials"
   - Passa da "Sandbox" a "Live"
   - Copia Client ID e Secret

3. **Aggiorna .env**
   ```
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=<tuo_client_id_live>
   PAYPAL_CLIENT_SECRET=<tuo_secret_live>
   ```

**Tempo**: 30 minuti
**Costo**: Gratis (PayPal prende 3.4% + 0.35€ per transazione)

---

### 3️⃣ STRIPE (OPZIONALE)

**Necessario?**: NO, se usi solo PayPal
**Se vuoi carte di credito dirette**:

1. Crea account su https://stripe.com/it
2. Completa verifica identità
3. Ottieni API keys LIVE
4. Aggiorna .env con chiavi live

**Tempo**: 1-2 giorni (verifica identità)
**Costo**: 1.5% + 0.25€ per transazione

---

### 4️⃣ EMAIL SERVICE (CONSIGLIATO)

**Per cosa**: Conferme ordini, notifiche
**Stato attuale**: NON configurato

#### Opzione A: SendGrid (Consigliato)
**Costo**: Gratis fino a 100 email/giorno
**Pro**: Semplice, affidabile, free tier generoso

**Setup**:
1. Crea account su https://sendgrid.com
2. Verifica dominio (o usa sendgrid.net)
3. Ottieni API Key
4. Aggiorna .env:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=<tua_api_key>
   EMAIL_FROM=ordini@zenova.it
   ```

#### Opzione B: Gmail SMTP
**Costo**: Gratis
**Pro**: Semplice se hai già Gmail
**Contro**: Limite 500 email/giorno

**Setup**:
1. Abilita 2FA su Gmail
2. Crea "App Password"
3. Aggiorna .env con credenziali

**Tempo**: 15-30 minuti
**Raccomandazione**: SendGrid

---

### 5️⃣ DOMINIO E SSL (OBBLIGATORIO)

**Cosa serve**:
1. **Dominio** (es: zenova.it)
   - Costo: ~10-15€/anno
   - Dove comprare: Namecheap, GoDaddy, Aruba

2. **SSL Certificate**
   - Se usi Railway/Vercel: GRATUITO (automatico)
   - Se usi VPS: Let's Encrypt (gratuito)

**Tempo**: 1 ora
**Costo**: ~10-15€/anno

---

### 6️⃣ DATABASE PRODUCTION (CONSIGLIATO)

**Stato attuale**: SQLite locale (OK per test)
**Per produzione**:

#### Opzione A: PostgreSQL su Railway
**Costo**: Incluso in Railway (~$5/mese)
**Pro**: Automatico, backup, scalabile
**Setup**: Click su Railway

#### Opzione B: Mantieni SQLite
**Costo**: Gratis
**Pro**: Semplice, nessuna config
**Contro**: Non scalabile, no backup automatici
**OK se**: Pochi ordini al giorno (<100)

**Raccomandazione**: PostgreSQL su Railway

---

### 7️⃣ PARTITA IVA E LEGALE (OBBLIGATORIO IN ITALIA)

**Prima di vendere online serve**:

1. ✅ **Partita IVA** (Forfettaria?)
2. ✅ **Privacy Policy** (GDPR)
3. ✅ **Cookie Policy**
4. ✅ **Termini e Condizioni**
5. ✅ **Informativa Resi e Rimborsi**

**Hai già**:
- Privacy Policy ✅ (privacy-policy.html)
- Cookie Policy ✅ (cookie-policy.html)
- Termini ✅ (termini-condizioni.html)
- Resi ✅ (resi-rimborsi.html)

**Manca solo**: Verificare conformità GDPR completa

---

## 📝 PIANO D'AZIONE - STEP BY STEP

### FASE 1: Preparazione (1-2 giorni)
1. ✅ Registra dominio zenova.it
2. ✅ Apri account PayPal Business (se non ce l'hai)
3. ✅ Crea account Railway
4. ✅ Crea account SendGrid
5. ⚠️ Verifica Partita IVA attiva

### FASE 2: Deploy Backend (2-3 ore)
1. Push codice su GitHub (se non già fatto)
2. Collega Railway a GitHub
3. Configura variabili ambiente su Railway:
   - PAYPAL_CLIENT_ID (live)
   - PAYPAL_CLIENT_SECRET (live)
   - SENDGRID_API_KEY
   - NODE_ENV=production
4. Deploy backend su Railway
5. Test API con Postman/Thunder Client

### FASE 3: Deploy Frontend (1 ora)
1. Collega Vercel a GitHub
2. Configura build settings
3. Punta dominio a Vercel
4. SSL automatico attivato
5. Test completo sito

### FASE 4: Test Completo (2-3 ore)
1. ✅ Test navigazione sito
2. ✅ Test aggiunta al carrello
3. ✅ Test checkout PayPal (ordine reale €1)
4. ✅ Test ricezione email ordine
5. ✅ Test admin panel
6. ✅ Test su mobile

### FASE 5: GO LIVE! 🚀
1. ✅ Annuncio sui social
2. ✅ Monitoraggio ordini
3. ✅ Supporto clienti attivo

---

## 💰 COSTI MENSILI STIMATI

### Setup Iniziale (Una Tantum)
- Dominio zenova.it: **€12/anno** (~€1/mese)

### Costi Mensili Ricorrenti
- **Railway** (backend + database): **$10/mese** (~€9)
- **Vercel** (frontend): **Gratis**
- **SendGrid** (email): **Gratis** (fino 100 email/giorno)
- **PayPal**: **Solo commissioni** (3.4% + €0.35 per vendita)
- **Stripe** (opzionale): **Solo commissioni** (1.5% + €0.25)

**TOTALE: ~€10/mese + commissioni vendite**

### Alternative Low-Cost
- VPS Hetzner: **€4.50/mese** (tutto incluso)
- Netlify/Vercel: **Gratis** frontend
- SQLite: **Gratis** (no database cost)

**MINIMO POSSIBILE: €4.50/mese**

---

## ⚡ TEMPO TOTALE STIMATO

- **Veloce** (Railway + tutto pronto): **4-6 ore**
- **Medio** (con setup PayPal/Email): **1-2 giorni**
- **Completo** (VPS custom): **3-5 giorni**

---

## 🚨 COSA SERVE FARE SUBITO

### Priorità 1 (OBBLIGATORIO)
1. ⚠️ **Scegliere hosting** (Railway consigliato)
2. ⚠️ **PayPal live** (passare da sandbox a production)
3. ⚠️ **Dominio** (zenova.it)

### Priorità 2 (IMPORTANTE)
4. ⚠️ **Email service** (SendGrid)
5. ⚠️ **Database** (PostgreSQL)

### Priorità 3 (OPTIONAL)
6. ⏸️ Stripe (se vuoi carte oltre PayPal)
7. ⏸️ Analytics (Google Analytics)
8. ⏸️ Marketing (Facebook Pixel)

---

## 📞 DECISIONI DA PRENDERE

### Domande per te:

1. **Hai già Partita IVA attiva?** ⬜ SI ⬜ NO
2. **Hai già account PayPal Business?** ⬜ SI ⬜ NO
3. **Budget mensile per hosting?**
   - ⬜ Minimo possibile (~€5)
   - ⬜ Standard (~€10)
   - ⬜ Professionale (~€20+)
4. **Vuoi anche Stripe o solo PayPal?**
   - ⬜ Solo PayPal
   - ⬜ PayPal + Stripe
5. **Quando vuoi andare online?**
   - ⬜ Questa settimana
   - ⬜ Prossime 2 settimane
   - ⬜ Entro fine anno

---

## 🎯 MIA RACCOMANDAZIONE

**Setup Ideale per Zenova**:

```
✅ Hosting: Railway ($10/mese) - Backend + PostgreSQL
✅ Frontend: Vercel (Gratis) - Deploy automatico
✅ Pagamenti: PayPal Live (commissioni 3.4% + €0.35)
✅ Email: SendGrid (Gratis fino 100/giorno)
✅ Dominio: zenova.it (~€12/anno)
✅ SSL: Automatico (Vercel + Railway)

COSTO TOTALE: ~€11/mese + commissioni vendite
TEMPO SETUP: 4-6 ore
PRONTO IN: 1-2 giorni
```

**Perché questa scelta?**
- ✅ Deploy automatico (aggiornamenti facili)
- ✅ SSL gratuito
- ✅ Scalabile (cresce con te)
- ✅ Backup automatici database
- ✅ 99.9% uptime garantito
- ✅ Zero manutenzione server

---

## 📋 PROSSIMO STEP

**Dimmi**:
1. Quale hosting preferisci? (Railway / VPS / Altro)
2. Hai già PayPal Business?
3. Quando vuoi andare online?

**E posso**:
- Creare guide dettagliate per il deploy
- Aiutarti a configurare PayPal live
- Preparare variabili ambiente production
- Testare tutto prima del go-live

---

**Pronto a procedere?** 🚀
