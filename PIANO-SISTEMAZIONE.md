# PIANO SISTEMAZIONE DEFINITIVA ZENOVA
Data: 2025-12-30

## OBIETTIVO
Sistema e-commerce 100% funzionante e pronto per vendite reali.

## FASI (in ordine di priorità)

### FASE 1: Catalogo Online via API ⏱️ 30 min
**Problema**: products.json (7.8MB) troppo grande per GitHub
**Soluzione**: Endpoint `/api/products` su Railway che serve il catalogo
**Steps**:
1. Creare route `/api/products` in backend
2. Modificare script.js frontend per fetch da API
3. Deploy e test
**Risultato**: Bundle visibili online ✅

### FASE 2: Database Ordini ⏱️ 45 min
**Problema**: Ordini in file JSON si perdono ad ogni deploy
**Soluzione**: PostgreSQL gratuito su Railway
**Steps**:
1. Creare database PostgreSQL su Railway dashboard
2. Installare `pg` nel backend
3. Migrare OrderService da file a database
4. Testare creazione/lettura ordini
**Risultato**: Ordini persistenti ✅

### FASE 3: Checkout Multi-Fornitore ⏱️ 60 min
**Problema**: Checkout controlla stock solo su BigBuy
**Soluzione**: Distinguere prodotti per fornitore e chiamare API corretta
**Steps**:
1. Modificare checkout.js per separare prodotti AW/BigBuy
2. Chiamare AW API per stock prodotti AW
3. Chiamare BigBuy API per stock prodotti BigBuy
4. Testare con prodotti di entrambi i fornitori
**Risultato**: Stock check corretto ✅

### FASE 4: Bundle Unpacking ⏱️ 30 min
**Problema**: Backend non sa scomporre bundle
**Soluzione**: Riconoscere bundle e espanderli in componenti
**Steps**:
1. Aggiungere logica riconoscimento bundle (campo `bundleContents`)
2. Espandere bundle in prodotti singoli prima di stock check
3. Testare checkout con bundle
**Risultato**: Bundle ordinabili ✅

### FASE 5: Invio Automatico Ordini ⏱️ 90 min
**Problema**: Ordini non vengono inviati a fornitori
**Soluzione**: Webhook Stripe/PayPal → invio automatico
**Steps**:
1. Creare webhook endpoint per conferma pagamento
2. Quando pagamento confermato, dividere ordine per fornitore
3. Inviare ordini AW via loro API
4. Inviare ordini BigBuy via loro API
5. Salvare riferimenti ordini fornitore in database
**Risultato**: Fulfillment automatico ✅

### FASE 6: Testing End-to-End ⏱️ 30 min
**Steps**:
1. Test checkout prodotto BigBuy
2. Test checkout prodotto AW
3. Test checkout bundle
4. Test checkout misto (BigBuy + AW + Bundle)
5. Verificare ordini salvati in database
6. Verificare invio a fornitori (mock/sandbox)
**Risultato**: Sistema testato ✅

### FASE 7: Deploy Finale ⏱️ 15 min
**Steps**:
1. Commit finale di tutto il codice
2. Push a GitHub
3. Verifica auto-deploy Railway + Vercel
4. Test checkout online reale
5. Verifica bundle online
**Risultato**: LIVE e pronto per vendere! 🚀

## TEMPO TOTALE STIMATO
⏱️ **5 ore** (con pause)

## PRIORITÀ
🔴 CRITICO: Fasi 1, 2, 3, 4 (senza queste NON puoi vendere)
🟡 IMPORTANTE: Fase 5 (puoi evadere manualmente temporaneamente)
🟢 FINALE: Fasi 6, 7 (verifica e deploy)

## INIZIO
Partiamo dalla FASE 1 ora?
