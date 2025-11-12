# 🚀 GUIDA: Avvio Automatico Zenova

**Problema**: Quando apro Zenova dai preferiti, non vedo i prodotti perché il server non è attivo.

**Soluzione**: Configurare l'avvio automatico del server!

---

## ✅ SOLUZIONE RAPIDA (Consigliata)

### Metodo 1: Doppio click su APRI-ZENOVA.bat

**Ogni volta che vuoi aprire Zenova**:

1. Fai doppio click su: `APRI-ZENOVA.bat`
2. Lo script verifica se il server è attivo
3. Se non è attivo, lo avvia automaticamente
4. Apre Zenova nel browser

**Salva nei preferiti**: http://localhost:3000

---

## ⚙️ CONFIGURAZIONE AVVIO AUTOMATICO (Una sola volta)

Se vuoi che il server si avvii **automaticamente all'accesso di Windows**:

### Passo 1: Crea collegamento

1. Fai **click destro** su `AVVIA-BACKEND-SILENZIOSO.bat`
2. Seleziona **Invia a → Desktop (crea collegamento)**
3. Rinomina il collegamento in: `Zenova Server`

### Passo 2: Aggiungi a Esecuzione Automatica

**Windows 10/11**:

1. Premi `Win + R`
2. Scrivi: `shell:startup`
3. Premi `Invio`
4. Si apre la cartella **Esecuzione automatica**
5. **Trascina** il collegamento `Zenova Server` in questa cartella
6. Fatto! ✅

D'ora in poi, quando accedi a Windows:
- Il server Zenova si avvia automaticamente in background
- Puoi aprire http://localhost:3000 quando vuoi
- I prodotti saranno sempre visibili!

### Passo 3: Testa

1. **Riavvia il PC**
2. Apri il browser
3. Vai su: http://localhost:3000
4. Dovresti vedere i 370 prodotti! 🎉

---

## 🔧 VERIFICA SE IL SERVER È ATTIVO

Apri il **Prompt dei comandi** (cmd) e scrivi:

```batch
netstat -ano | findstr :3000
```

**Se vedi output**: ✅ Server attivo
**Se non vedi nulla**: ❌ Server spento

---

## 📝 FILE CREATI

Nella cartella `zenova-ecommerce` troverai:

| File | Descrizione |
|------|-------------|
| `AVVIA-ZENOVA.bat` | Avvia tutto e apre browser |
| `AVVIA-BACKEND-SILENZIOSO.bat` | Solo server (silenzioso) |
| `APRI-ZENOVA.bat` | Smart: verifica + avvia se serve |

---

## 🎯 RIEPILOGO

### Prima (Problema):
1. Apro pagina dai preferiti
2. Server non attivo ❌
3. Nessun prodotto visibile 😔

### Dopo (Soluzione):
1. Server si avvia automaticamente all'accesso Windows ✅
2. Apro pagina dai preferiti
3. 370 prodotti visibili! 🎉

---

## 🆘 TROUBLESHOOTING

### "Il server non si avvia"

Verifica che Node.js sia installato:
```batch
node --version
```

Se non installato: https://nodejs.org

### "Porta 3000 già in uso"

Uccidi i processi esistenti:
```batch
taskkill /F /IM node.exe
```

Poi riavvia con:
```batch
AVVIA-BACKEND-SILENZIOSO.bat
```

### "I prodotti non si vedono ancora"

1. Verifica che il server sia attivo (vedi sopra)
2. Premi `Ctrl + Shift + R` nel browser (ricarica forzata)
3. Apri Console (F12) e controlla errori

---

## 💡 TIPS

### Aggiungi ai Preferiti

Invece del file HTML, salva nei preferiti:
```
http://localhost:3000
```

### Crea Icona Desktop

Fai click destro su `APRI-ZENOVA.bat` → Invia a → Desktop

### Cambia Icona (Opzionale)

1. Click destro sul collegamento → Proprietà
2. Cambia icona
3. Scegli un'icona carina!

---

**Data creazione**: 12 Novembre 2025
**Versione**: 1.0
**Testato su**: Windows 10/11 con Node.js v22.21.0
