# 📦 ZENOVA FRONTEND - ISTRUZIONI UPLOAD FTP

Data: 14 Dicembre 2025 - ore 19:00

---

## 📋 CREDENZIALI FTP OVH

```
Server FTP: ftp.cluster100.hosting.ovh.net
Porta: 21
Username: zenovab
Password: [la password che hai impostato]
Cartella destinazione: /shop
```

---

## 🚀 COME CARICARE I FILE

### OPZIONE A: FileZilla (Consigliato)

1. **Scarica FileZilla** (se non ce l'hai)
   - https://filezilla-project.org/download.php
   - Versione Client (gratis)

2. **Connetti**:
   - Host: `ftp.cluster100.hosting.ovh.net`
   - Nome utente: `zenovab`
   - Password: [la tua password]
   - Porta: `21`
   - Click "Connessione rapida"

3. **Naviga** nella cartella `/shop` (lato destro - server)

4. **Carica tutti i file**:
   - Seleziona TUTTI i file in questa cartella
   - Trascina nel pannello destro (cartella `/shop`)
   - Attendi upload completo

---

### OPZIONE B: Client FTP Windows

1. Apri Esplora File
2. Nella barra indirizzi scrivi:
   ```
   ftp://zenovab@ftp.cluster100.hosting.ovh.net
   ```
3. Inserisci password quando richiesta
4. Vai in cartella `shop`
5. Copia e incolla tutti i file

---

## 📂 FILE DA CARICARE

Tutti i file in questa cartella `frontend-production`:

```
✅ index.html (homepage)
✅ prodotti.html (catalogo)
✅ checkout.html (pagamento)
✅ checkout-success.html
✅ admin.html (pannello admin)
✅ chi-siamo.html
✅ contatti.html
✅ privacy-policy.html
✅ cookie-policy.html
✅ termini-condizioni.html
✅ resi-rimborsi.html
✅ spedizioni-consegne.html

✅ config.js ⭐ IMPORTANTE
✅ api-client.js
✅ script.js
✅ sidebar.js
✅ category-products.js
✅ checkout.js
✅ admin.js
✅ auth.js

✅ styles.css
✅ checkout.css
✅ admin.css
✅ auth.css

✅ logo.jpg
✅ logo.svg
✅ logo-11.png
✅ *.jpg, *.png, *.avif (immagini)
✅ video-zenova.mp4
```

**TOTALE**: ~40-50 file

---

## ⚙️ CONFIGURAZIONE BACKEND

### ⚠️ IMPORTANTE - DOPO AVER DEPLOYATO IL BACKEND

Una volta che il backend sarà online su Render.com, dovrai:

1. **Copiare l'URL del backend**
   Esempio: `https://zenova-backend.onrender.com`

2. **Modificare il file `config.js`**:
   ```javascript
   // Cambia questa riga:
   const API_BASE_URL = 'http://localhost:3000/api';

   // In questa:
   const API_BASE_URL = 'https://zenova-backend.onrender.com/api';
   ```

3. **Ri-caricare config.js su FTP**
   - Solo questo file
   - Sovrascrivendo quello esistente

---

## 🌐 URL FINALI

Dopo l'upload, il sito sarà disponibile su:

```
Homepage: https://shop.zenova.ovh
Catalogo: https://shop.zenova.ovh/prodotti.html
Checkout: https://shop.zenova.ovh/checkout.html
Admin: https://shop.zenova.ovh/admin.html
```

**⏱️ Tempo propagazione DNS**: 15-30 minuti (potrebbe richiedere fino a 24h)

---

## ✅ CHECKLIST UPLOAD

- [ ] FileZilla installato
- [ ] Connesso a FTP OVH
- [ ] Navigato in cartella `/shop`
- [ ] Caricati TUTTI i file
- [ ] Verificato upload completato (nessun errore)
- [ ] Testato https://shop.zenova.ovh (dopo 15-30 min)

---

## 🆘 PROBLEMI COMUNI

### "Impossibile connettersi"
✅ Verifica username e password
✅ Controlla di usare porta 21
✅ Disattiva temporaneamente firewall

### "Permessi negati"
✅ Verifica di essere nella cartella `/shop`
✅ L'account FTP ha permessi su quella cartella

### "Sito non raggiungibile dopo upload"
✅ Aspetta 15-30 minuti (propagazione DNS)
✅ Svuota cache browser (Ctrl + F5)
✅ Prova in modalità incognito

### "Prodotti non si caricano"
✅ Backend non ancora deployato (normale!)
✅ Dopo deploy backend, aggiorna `config.js`

---

## 📞 SUPPORTO

Se hai problemi:
1. Verifica tutti i passaggi sopra
2. Controlla console browser (F12) per errori
3. Verifica che tutti i file siano stati caricati

---

## 🎯 PROSSIMI STEP DOPO UPLOAD

1. ✅ Upload frontend completato
2. ⏳ Deploy backend su Render.com
3. ⏳ Aggiorna config.js con URL backend
4. ⏳ Configura PayPal LIVE
5. ⏳ Test completo e-commerce
6. 🚀 GO LIVE!

---

**Tutto pronto per l'upload!** 🎉
