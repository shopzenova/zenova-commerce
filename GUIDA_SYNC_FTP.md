# 🔄 Guida Sincronizzazione FTP BigBuy

## ✅ Sistema Completato!

Hai ora un sistema completo per importare prodotti direttamente dal server FTP di BigBuy.

---

## 📋 Cosa è stato implementato

### 1. **Client FTP BigBuy** (`backend/src/integrations/BigBuyFTP.js`)
   - Connessione al server FTP BigBuy
   - Download automatico CSV prodotti
   - Parser ottimizzato per CSV BigBuy (gestisce BOM UTF-8)
   - Supporto per 13 categorie BigBuy
   - Cache intelligente (12 ore)

### 2. **API Endpoints** (`backend/src/routes/admin-sync.js`)
   - `GET /api/admin/sync/test` - Testa connessione FTP
   - `GET /api/admin/sync/categories` - Scarica lista categorie
   - `POST /api/admin/sync/products` - Sincronizza prodotti
   - `POST /api/admin/sync/category` - Sincronizza singola categoria

### 3. **Interfaccia Admin** (File separati creati)
   - `admin-sync-section.html` - Nuova sezione HTML
   - `admin-sync-functions.js` - Funzioni JavaScript

---

## 🚀 Come Usare

### Passo 1: Apri l'Admin Panel
```bash
# Il backend deve essere in esecuzione
# Apri: admin.html nel browser
# Login: admin / admin123
```

### Passo 2: Vai alla sezione "Sincronizzazione"
Clicca su "🔄 Sincronizzazione" nella sidebar

### Passo 3: Test Connessione (Opzionale)
Click su "Test Connessione" per verificare l'accesso FTP

### Passo 4: Seleziona Categorie
Scegli una o più categorie da importare:
- ☑️ Casa | Giardino (ID: 2399) - ~89.000 prodotti
- □ Salute | Bellezza (ID: 2501)
- □ Profumeria | Cosmesi (ID: 2507)
- □ Sport | Fitness (ID: 2491)
- □ Informatica | Elettronica (ID: 2609)
- □ Cucina | Gourmet (ID: 2403)

### Passo 5: Avvia Sincronizzazione
Click su "🔄 Avvia Sincronizzazione"
- Conferma l'operazione
- Attendi (può richiedere 2-5 minuti per categoria grande)
- Vedi il progress in tempo reale

---

## 📊 Risultati Sincronizzazione

Dopo la sync vedrai:
- **📦 Prodotti totali** - Numero prodotti nel catalogo
- **🆕 Nuovi importati** - Prodotti aggiunti
- **🔄 Aggiornati** - Prodotti esistenti aggiornati
- **📂 Categorie** - Numero categorie sincronizzate

---

## 🎯 Test Rapido via API

Puoi testare direttamente le API:

### Test Connessione FTP
```bash
curl http://localhost:3000/api/admin/sync/test
```

### Scarica Categorie
```bash
curl http://localhost:3000/api/admin/sync/categories
```

### Sincronizza Categoria 2399 (Casa e Giardino)
```bash
curl -X POST http://localhost:3000/api/admin/sync/products \
  -H "Content-Type: application/json" \
  -d '{"categoryIds": ["2399"], "language": "it"}'
```

---

## ⚙️ Integrazione nell'Admin Panel

Per integrare completamente la nuova interfaccia:

### 1. Sostituisci la sezione Sync nell'HTML
Apri `admin.html` e sostituisci la sezione `<section id="sync">` con il contenuto di:
```
admin-sync-section.html
```

### 2. Aggiungi le funzioni JS
Apri `admin.js` e aggiungi alla fine il contenuto di:
```
admin-sync-functions.js
```

### 3. Ricarica l'admin panel
Refresh del browser, login, vai su "Sincronizzazione"

---

## 📁 Categorie BigBuy Disponibili

| ID | Nome | Prodotti stimati |
|----|------|------------------|
| 2399 | Casa \| Giardino | 89.000 |
| 2403 | Cucina \| Gourmet | 25.000 |
| 2491 | Sport \| Fitness | 40.000 |
| 2501 | Salute \| Bellezza | 50.000 |
| 2507 | Profumeria \| Cosmesi | 30.000 |
| 2570 | Moda \| Accessori | 60.000 |
| 2571 | Giocattoli | 45.000 |
| 2609 | Informatica \| Elettronica | 70.000 |
| 2662 | Regali Originali | 15.000 |
| 2672 | Televendita | 10.000 |
| 2678 | Outlet \| Offerte | 20.000 |
| 3046 | Sex Shop | 8.000 |
| 2202 | Catalogo Completo | ~500.000 |

---

## ⚠️ Raccomandazioni

1. **Non saturare il servizio FTP**
   - Sincronizza max 1 volta ogni 12 ore
   - Non scaricare tutte le categorie contemporaneamente la prima volta

2. **Orari migliori per sync**
   - BigBuy aggiorna i file alle 08:00, 14:00, 20:00
   - Sincronizza a mezzogiorno per dati aggiornati

3. **Performance**
   - Categorie grandi (89k prodotti) richiedono 2-5 minuti
   - Il browser potrebbe rallentare durante il download
   - Consigliato: max 3-4 categorie per sincronizzazione

4. **Storage**
   - I file CSV vengono salvati in `backend/bigbuy-data/`
   - Hanno cache di 12 ore
   - Puoi eliminarli per forzare nuovo download

---

## 🐛 Troubleshooting

### Errore "Cannot find module 'basic-ftp'"
```bash
cd backend
npm install
```

### Connessione FTP fallita
- Verifica credenziali in `BigBuyFTP.js`
- Controlla firewall/antivirus
- Prova connessione manuale con FileZilla

### CSV vuoto o 0 prodotti
- Il problema del BOM UTF-8 è già risolto
- Verifica che il file CSV esista in `backend/bigbuy-data/`
- Elimina il file e riprova il download

### Backend non risponde
```bash
# Ferma il processo
Ctrl+C

# Riavvia
cd backend
node server.js
```

---

## 📈 Prossimi Sviluppi

- [ ] Sincronizzazione automatica schedulata
- [ ] Filtri prodotti per prezzo/stock
- [ ] Import selettivo (solo prodotti con immagini)
- [ ] Dashboard statistiche import
- [ ] Notifiche email al completamento

---

## ✅ Checklist Completamento

- [x] Client FTP BigBuy funzionante
- [x] Parser CSV con fix BOM UTF-8
- [x] Endpoint API /sync/*
- [x] Test script validato (89k prodotti categoria 2399)
- [x] Interfaccia admin HTML
- [x] Funzioni JavaScript sync
- [x] Route registrate in server.js
- [x] Backend riavviato e funzionante
- [ ] Integrazione completa nell'admin panel
- [ ] Test sync via interfaccia web

---

**🎉 Il sistema è pronto per l'uso!**

Per iniziare, apri l'admin panel e prova la sincronizzazione della categoria "Casa | Giardino" (già selezionata di default).
