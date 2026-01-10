# ANALISI STATO ZENOVA E-COMMERCE
Data: 2025-12-30

## FRONTEND
- Locale (root): ✅ Funzionante con tutte le features
- Online (Vercel): ⚠️ Prodotti non aggiornati (file 7.8MB non su GitHub)
- Checkout: ✅ Stripe + PayPal configurati

## BACKEND (Railway)
- API: ✅ Online e funzionante
- Ordini: ⚠️ File JSON (si perdono ad ogni deploy)
- Stripe: ✅ Configurato
- PayPal: ✅ Configurato
- BigBuy: ✅ API configurata
- AW Dropship: ✅ API configurata

## CATALOGO
- Prodotti totali: 4,270
- Bundle creati: 2 (Incense Starter + Premium)
- Fornitori: BigBuy + AW Dropship
- Problema: products.json (7.8MB) troppo grande per GitHub

## PROBLEMI CRITICI

### 1. BUNDLE NON ONLINE ⚠️⚠️⚠️
- Creati e funzionanti in locale
- Non visibili online (products.json non aggiornato)
- Causa: GitHub rifiuta file >5MB

### 2. CHECKOUT NON PRONTO PER AW ⚠️⚠️⚠️
- Controlla stock solo su BigBuy
- Prodotti AW non verificati correttamente
- Nessuna logica per inviare ordini ad AW

### 3. BUNDLE NON GESTITI DA BACKEND ⚠️⚠️⚠️
- Backend non sa "scomporre" bundle
- AW/BigBuy riceverebbero SKU bundle (non esistente)
- Ordini bundle fallirebbero

### 4. ORDINI SI PERDONO ⚠️⚠️
- Salvati in file JSON
- Cancellati ad ogni deploy Railway
- Serve database persistente

### 5. NESSUN INVIO AUTOMATICO ORDINI ⚠️⚠️
- Ordini salvati ma non inviati a fornitori
- Processo completamente manuale
- Cliente paga ma merce non viene ordinata

## COSA FUNZIONA
✅ Checkout locale con Stripe/PayPal
✅ Calcolo spedizione
✅ Pagamenti simulati
✅ Admin panel
✅ Catalogo completo in locale
✅ Backend API base

## COSA NON FUNZIONA
❌ Sincronizzazione catalogo online
❌ Checkout multi-fornitore (AW + BigBuy)
❌ Bundle unpacking
❌ Persistenza ordini
❌ Invio automatico ordini a fornitori
❌ Gestione stock real-time
