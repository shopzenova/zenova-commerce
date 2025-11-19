// ===== FUNZIONI SINCRONIZZAZIONE FTP BIGBUY =====
// Aggiungere queste funzioni alla fine di admin.js

// Test connessione FTP
async function testFTPConnection() {
    const statusEl = document.getElementById('ftpConnectionStatus');
    statusEl.textContent = '⏳ Test in corso...';
    statusEl.style.color = '#ffc107';

    try {
        const response = await fetch(`${API_BASE}/admin/sync/test`);
        const result = await response.json();

        if (result.success) {
            statusEl.textContent = `✅ Connessione OK - ${result.data.folders} cartelle trovate`;
            statusEl.style.color = '#28a745';
            alert(`✅ Connessione FTP BigBuy riuscita!\n\n${result.data.folders} cartelle accessibili sul server.`);
        } else {
            statusEl.textContent = `❌ Connessione fallita: ${result.error}`;
            statusEl.style.color = '#dc3545';
            alert(`❌ Errore connessione FTP:\n${result.error}`);
        }
    } catch (error) {
        console.error('Errore test FTP:', error);
        statusEl.textContent = `❌ Errore: ${error.message}`;
        statusEl.style.color = '#dc3545';
        alert(`❌ Errore durante il test:\n${error.message}`);
    }
}

// Carica categorie disponibili da BigBuy
async function loadAvailableCategories() {
    const categoryList = document.getElementById('categoryList');

    try {
        categoryList.innerHTML = '<p style="text-align: center; padding: 20px;">⏳ Caricamento categorie...</p>';

        const response = await fetch(`${API_BASE}/admin/sync/categories`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            categoryList.innerHTML = '';

            result.data.forEach(category => {
                if (!category.id || !category.name) return; // Skip invalid

                const label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; cursor: pointer;';

                label.innerHTML = `
                    <input type="checkbox" class="category-checkbox" value="${category.id}" style="margin-right: 10px;">
                    <span><strong>${category.name}</strong><br><small style="color: #666;">ID: ${category.id}</small></span>
                `;

                categoryList.appendChild(label);
            });

            alert(`✅ Caricate ${result.data.length} categorie BigBuy!`);
        } else {
            categoryList.innerHTML = '<p style="color: #dc3545;">❌ Nessuna categoria trovata</p>';
        }
    } catch (error) {
        console.error('Errore caricamento categorie:', error);
        categoryList.innerHTML = '<p style="color: #dc3545;">❌ Errore caricamento categorie</p>';
        alert(`❌ Errore:\n${error.message}`);
    }
}

// Avvia sincronizzazione FTP
async function startFTPSync() {
    // Raccogli categorie selezionate
    const checkboxes = document.querySelectorAll('.category-checkbox:checked');
    const categoryIds = Array.from(checkboxes).map(cb => cb.value);

    if (categoryIds.length === 0) {
        alert('⚠️ Seleziona almeno una categoria da sincronizzare!');
        return;
    }

    // Conferma
    const confirmed = confirm(
        `🔄 Avviare la sincronizzazione?\n\n` +
        `Categorie selezionate: ${categoryIds.length}\n` +
        `IDs: ${categoryIds.join(', ')}\n\n` +
        `⚠️ Questa operazione potrebbe richiedere diversi minuti.\n` +
        `Il browser potrebbe rallentare durante il download.`
    );

    if (!confirmed) return;

    // Mostra progress
    const progressDiv = document.getElementById('syncProgress');
    const progressBar = document.getElementById('syncProgressBar');
    const progressText = document.getElementById('syncProgressText');
    const resultsDiv = document.getElementById('syncResults');

    progressDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    progressBar.style.width = '10%';
    progressText.textContent = `Connessione al server FTP BigBuy...`;

    try {
        // Chiamata API
        progressBar.style.width = '30%';
        progressText.textContent = `Download prodotti da ${categoryIds.length} categorie...`;

        const response = await fetch(`${API_BASE}/admin/sync/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoryIds: categoryIds,
                language: 'it'
            })
        });

        progressBar.style.width = '80%';
        progressText.textContent = 'Elaborazione dati...';

        const result = await response.json();

        progressBar.style.width = '100%';
        progressText.textContent = 'Completato!';

        if (result.success) {
            // Nascondi progress, mostra risultati
            setTimeout(() => {
                progressDiv.style.display = 'none';
                resultsDiv.style.display = 'block';

                // Aggiorna statistiche
                document.getElementById('resultTotalProducts').textContent = result.data.totalProducts || 0;
                document.getElementById('resultNewProducts').textContent = result.data.newProducts || 0;
                document.getElementById('resultUpdatedProducts').textContent = result.data.updatedProducts || 0;
                document.getElementById('resultCategories').textContent = categoryIds.length;
                document.getElementById('resultTimestamp').textContent = `Sincronizzato: ${new Date().toLocaleString('it-IT')}`;

                // Alert successo
                alert(
                    `✅ Sincronizzazione completata!\n\n` +
                    `📦 Prodotti totali: ${result.data.totalProducts}\n` +
                    `🆕 Nuovi importati: ${result.data.newProducts}\n` +
                    `🔄 Aggiornati: ${result.data.updatedProducts}\n` +
                    `📂 Categorie: ${categoryIds.length}`
                );

                // Ricarica prodotti nella lista
                if (typeof loadProducts === 'function') {
                    loadProducts();
                }
            }, 1000);
        } else {
            progressDiv.style.display = 'none';
            alert(`❌ Errore sincronizzazione:\n${result.error}`);
        }
    } catch (error) {
        console.error('Errore sincronizzazione FTP:', error);
        progressDiv.style.display = 'none';
        alert(`❌ Errore durante la sincronizzazione:\n${error.message}`);
    }
}

console.log('✅ Funzioni FTP Sync caricate');
